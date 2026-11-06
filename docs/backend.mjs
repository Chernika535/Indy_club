import {projectUrl, publishableKey} from './backend-config.mjs';

export const configured = Boolean(projectUrl && publishableKey);
const profileFields = 'id,display_name,bio,practices,interests,open_to,is_public';
const entryFields = 'id,author_id,kind,title,body,world,topics,url,status,created_at';

function data(result) {
  if (result.error) throw result.error;
  return result.data;
}

export function safeUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

export async function connect() {
  const {createClient} = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.8/+esm');
  return makeBackend(createClient(projectUrl, publishableKey, {auth:{flowType:'pkce'}}));
}

export function makeBackend(client) {
  const entries = () => client.from('club_entries');
  const profiles = () => client.from('club_profiles');
  const saves = () => client.from('club_saves');
  const redirectTo = () => new URL(location.pathname, location.origin).href;

  return {
    watch(handler) {
      client.auth.onAuthStateChange((event, session) => {
        setTimeout(() => handler(event, session?.user ?? null), 0);
      });
    },
    async signIn(email,password) {
      return data(await client.auth.signInWithPassword({email,password}));
    },
    async signUp(email,password) {
      return data(await client.auth.signUp({email,password,options:{emailRedirectTo:redirectTo()}}));
    },
    async recover(email) {
      return data(await client.auth.resetPasswordForEmail(email,{redirectTo:redirectTo()}));
    },
    async setPassword(password) {
      return data(await client.auth.updateUser({password}));
    },
    async signOut() {
      data(await client.auth.signOut({scope:'local'}));
    },
    async loadPrivate(id) {
      const [profile, ownEntries, saved] = await Promise.all([
        profiles().select(profileFields).eq('id',id).maybeSingle(),
        entries().select(entryFields).eq('author_id',id).order('created_at',{ascending:false}),
        saves().select('entity_key').eq('user_id',id),
      ]);
      return {profile:data(profile), ownEntries:data(ownEntries), saved:data(saved).map(row=>row.entity_key)};
    },
    async publicEntries() {
      const [members, published] = await Promise.all([
        profiles().select(profileFields).eq('is_public',true).order('display_name').limit(100),
        entries().select(entryFields + ',club_profiles!inner(display_name)').eq('status','published')
          .eq('club_profiles.is_public',true).order('created_at',{ascending:false}).limit(100),
      ]);
      return {members:data(members), published:data(published)};
    },
    async getSavedContent(keys) {
      const idsFor = prefix => keys.filter(key=>key.startsWith(prefix)).map(key=>key.slice(prefix.length))
        .filter(id=>/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(id));
      const memberIds = idsFor('member:');
      const entryIds = idsFor('entry:');
      const collect = async (ids, select) => {
        const batches = [];
        for (let i = 0; i < ids.length; i += 50) batches.push(select(ids.slice(i,i+50)));
        return (await Promise.all(batches)).flatMap(data);
      };
      const [members, entries] = await Promise.all([
        collect(memberIds, ids=>profiles().select(profileFields).eq('is_public',true).in('id',ids)),
        collect(entryIds, ids=>entries().select(entryFields + ',club_profiles!inner(display_name)')
          .eq('status','published').eq('club_profiles.is_public',true).in('id',ids)),
      ]);
      return {members,entries};
    },
    async getEntry(id) {
      return data(await entries().select(entryFields + ',club_profiles!inner(display_name)').eq('status','published')
        .eq('club_profiles.is_public',true).eq('id',id).maybeSingle());
    },
    async getMember(id) {
      const [profile, content] = await Promise.all([
        profiles().select(profileFields).eq('id',id).eq('is_public',true).maybeSingle(),
        entries().select(entryFields).eq('author_id',id).eq('status','published')
          .order('created_at',{ascending:false}).limit(100),
      ]);
      return {profile:data(profile), entries:data(content)};
    },
    async saveProfile(id, values) {
      return data(await profiles().upsert({id,...values}).select(profileFields).single());
    },
    async saveEntry(id, owner, values) {
      const query = id ? entries().update(values).eq('id',id).eq('author_id',owner) :
        entries().insert({...values,author_id:owner});
      return data(await query.select(entryFields).single());
    },
    async setSaved(user_id, entity_key, save) {
      if (save) {
        const result = await saves().upsert({user_id,entity_key},{ignoreDuplicates:true});
        data(result);
      } else {
        data(await saves().delete().eq('user_id',user_id).eq('entity_key',entity_key));
      }
    },
  };
}
