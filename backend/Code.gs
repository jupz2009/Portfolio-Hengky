/* HENGKY KURNIAWAN PORTFOLIO — Google Apps Script backend
 * Deploy as Web App: Execute as Me; access Anyone.
 * Set Script Properties before deployment:
 * OWNER_PASSWORD, HK_STUDIO_PROFILE (optional),
 * HK_STUDIO_DATABASE_ID (optional), HK_STUDIO_FOLDER_ID (optional).
 * Never put OWNER_PASSWORD in source code or Git.
 */
const PROFILE_KEY = 'HK_STUDIO_PROFILE';
const DATABASE_KEY = 'HK_STUDIO_DATABASE_ID';
const FOLDER_KEY = 'HK_STUDIO_FOLDER_ID';
const OWNER_PASSWORD_KEY = 'OWNER_PASSWORD';

function doGet() {
  return ContentService.createTextOutput('Hengky Portfolio API aktif.')
    .setMimeType(ContentService.MimeType.TEXT);
}
function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
function getDatabase_() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty(DATABASE_KEY);
  let ss = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.create('Hengky Kurniawan Portfolio Database');
  if (!id) props.setProperty(DATABASE_KEY, ss.getId());
  let works = ss.getSheetByName('Works');
  if (!works) { works = ss.insertSheet('Works'); works.appendRow(['ID','Title','Description','File URL','File ID','Type','Date']); }
  let comments = ss.getSheetByName('Comments');
  if (!comments) { comments = ss.insertSheet('Comments'); comments.appendRow(['ID','Name','Message','Date','Status']); }
  if (comments.getLastColumn() < 5) comments.getRange(1,5).setValue('Status');
  return ss;
}
function getFolder_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty(FOLDER_KEY);
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) {} }
  const folder = DriveApp.createFolder('Hengky Kurniawan Portfolio Files');
  props.setProperty(FOLDER_KEY, folder.getId());
  return folder;
}
function getProfile_() {
  const saved = PropertiesService.getScriptProperties().getProperty(PROFILE_KEY);
  if (saved) { try { return JSON.parse(saved); } catch (e) {} }
  return {name:'Hengky Kurniawan',intro:'Pelajar Desain Komunikasi Visual yang tertarik pada fotografi, videografi, dan desain kreatif.',about:'Saya adalah siswa SMKS Asoka Singkawang jurusan Desain Komunikasi Visual. Saya memiliki minat dalam bidang fotografi, videografi, dan desain grafis.',school:'SMKS Asoka Singkawang · XI DKV',contact:'Punya pertanyaan atau ingin bekerja sama? Hubungi saya melalui WhatsApp atau Instagram.',whatsapp:'',instagram:'',photo:''};
}
function verifyOwner_(token) {
  return !!token && typeof token === 'string' &&
    CacheService.getScriptCache().get('HK_OWNER_' + token) === 'valid';
}
function loginOwner(password) {
  const expected = PropertiesService.getScriptProperties().getProperty(OWNER_PASSWORD_KEY);
  if (!expected) return {success:false,message:'Password pemilik belum diatur pada Script Properties.'};
  if (typeof password !== 'string' || password !== expected) return {success:false,message:'Password salah.'};
  const token = Utilities.getUuid();
  CacheService.getScriptCache().put('HK_OWNER_' + token, 'valid', 21600);
  return {success:true,token:token};
}
function logoutOwner(token) {
  if (token) CacheService.getScriptCache().remove('HK_OWNER_' + token);
  return {success:true};
}
function getPortfolioData(token) {
  const ss = getDatabase_(), owner = verifyOwner_(token);
  const ws = ss.getSheetByName('Works'), cs = ss.getSheetByName('Comments');
  const workRows = ws.getLastRow()>1 ? ws.getRange(2,1,ws.getLastRow()-1,7).getValues() : [];
  const commentRows = cs.getLastRow()>1 ? cs.getRange(2,1,cs.getLastRow()-1,5).getValues() : [];
  const works = workRows.reverse().map(r=>({id:String(r[0]),title:String(r[1]),description:String(r[2]),url:String(r[3]),fileId:String(r[4]),type:String(r[5]),date:r[6] instanceof Date?r[6].toISOString():String(r[6])}));
  const allComments = commentRows.reverse().map(r=>({id:String(r[0]),name:String(r[1]),message:String(r[2]),date:r[3] instanceof Date?r[3].toISOString():String(r[3]),status:String(r[4]||'Approved')}));
  return {profile:getProfile_(),works:works,comments:allComments.filter(c=>c.status.toLowerCase()==='approved'),pendingComments:owner?allComments.filter(c=>c.status.toLowerCase()==='pending'):[],isOwner:owner};
}
function saveProfile(token,data) {
  if (!verifyOwner_(token)) throw new Error('Akses ditolak. Silakan login kembali.');
  data=data||{};
  const old=getProfile_();
  const profile={name:String(data.name||'').slice(0,100),intro:String(data.intro||'').slice(0,500),about:String(data.about||'').slice(0,1000),school:String(data.school||'').slice(0,150),contact:String(data.contact||'').slice(0,300),whatsapp:String(data.whatsapp||'').replace(/\D/g,'').slice(0,20),instagram:String(data.instagram||'').replace(/^@/,'').replace(/^https?:\/\/(www\.)?instagram\.com\//i,'').replace(/\/.*$/,'').trim().slice(0,50),photo:old.photo||''};
  PropertiesService.getScriptProperties().setProperty(PROFILE_KEY,JSON.stringify(profile));
  return {success:true};
}
function saveProfilePhoto(token,dataUrl) {
  if (!verifyOwner_(token)) throw new Error('Akses ditolak.');
  const m=String(dataUrl||'').match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!m) throw new Error('Foto harus JPG, PNG, atau WEBP yang valid.');
  const bytes=Utilities.base64Decode(m[2]);
  if (bytes.length>10*1024*1024) throw new Error('Foto hasil crop maksimal 10 MB.');
  const file=getFolder_().createFile(Utilities.newBlob(bytes,m[1],'Hengky-Profile-'+Date.now()));
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);
  const p=getProfile_(); p.photo='https://drive.google.com/thumbnail?id='+file.getId()+'&sz=w1000';
  PropertiesService.getScriptProperties().setProperty(PROFILE_KEY,JSON.stringify(p));
  return {success:true};
}
function uploadWork(token,title,description,dataUrl,fileName) {
  if (!verifyOwner_(token)) throw new Error('Akses ditolak. Silakan login kembali.');
  title=String(title||'').trim().slice(0,100); description=String(description||'').trim().slice(0,500);
  if (!title) throw new Error('Judul karya harus diisi.');
  const m=String(dataUrl||'').match(/^data:(image\/(?:jpeg|png|webp)|video\/(?:mp4|webm|quicktime));base64,([A-Za-z0-9+/=]+)$/);
  if (!m) throw new Error('Gunakan file JPG, PNG, WEBP, MP4, WEBM, atau MOV.');
  const bytes=Utilities.base64Decode(m[2]);
  if (bytes.length>20*1024*1024) throw new Error('Upload melalui jalur ini maksimal 20 MB. Upload besar memerlukan modul Drive resumable.');
  const safe=String(fileName||'karya').replace(/[^\w.-]/g,'_').slice(0,100);
  const file=getFolder_().createFile(Utilities.newBlob(bytes,m[1],safe));
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);
  const video=m[1].indexOf('video/')===0, type=video?'video':'image';
  const url=video?'https://drive.google.com/file/d/'+file.getId()+'/preview':'https://drive.google.com/thumbnail?id='+file.getId()+'&sz=w1200';
  getDatabase_().getSheetByName('Works').appendRow([Utilities.getUuid(),title,description,url,file.getId(),type,new Date()]);
  return {success:true};
}
function deleteWork(token,id) {
  if (!verifyOwner_(token)) throw new Error('Akses ditolak.');
  const sh=getDatabase_().getSheetByName('Works');
  const rows=sh.getLastRow()>1?sh.getRange(2,1,sh.getLastRow()-1,7).getValues():[];
  for (let i=0;i<rows.length;i++) if (String(rows[i][0])===String(id)) {
    try { DriveApp.getFileById(String(rows[i][4])).setTrashed(true); } catch(e) {}
    sh.deleteRow(i+2); return {success:true};
  }
  throw new Error('Karya tidak ditemukan.');
}
function addComment(name,message) {
  name=String(name||'').trim().replace(/[<>]/g,'').slice(0,60);
  message=String(message||'').trim().replace(/[<>]/g,'').slice(0,500);
  if (!name||!message) throw new Error('Nama dan komentar harus diisi.');
  if (name.length<2||message.length<3) throw new Error('Nama atau komentar terlalu singkat.');
  const cache=CacheService.getScriptCache();
  const key='HK_COMMENT_'+Utilities.base64EncodeWebSafe(name.toLowerCase()).slice(0,40);
  if (cache.get(key)) throw new Error('Komentar dengan nama ini baru saja dikirim. Coba lagi beberapa menit.');
  cache.put(key,'1',120);
  getDatabase_().getSheetByName('Comments').appendRow([Utilities.getUuid(),name,message,new Date(),'Pending']);
  return {success:true,pending:true,message:'Komentar dikirim dan menunggu persetujuan pemilik.'};
}
function moderateComment(token,id,status) {
  if (!verifyOwner_(token)) throw new Error('Akses ditolak.');
  status=String(status||'').toLowerCase();
  if (status!=='approved'&&status!=='rejected') throw new Error('Status moderasi tidak valid.');
  const sh=getDatabase_().getSheetByName('Comments');
  const rows=sh.getLastRow()>1?sh.getRange(2,1,sh.getLastRow()-1,5).getValues():[];
  for (let i=0;i<rows.length;i++) if (String(rows[i][0])===String(id)) {
    sh.getRange(i+2,5).setValue(status==='approved'?'Approved':'Rejected');
    return {success:true};
  }
  throw new Error('Komentar tidak ditemukan.');
}
function doPost(e) {
  try {
    const req=JSON.parse(e.postData.contents||'{}'), p=req.payload||{};
    let data;
    switch(req.action) {
      case 'loginOwner': data=loginOwner(p.password); break;
      case 'logoutOwner': data=logoutOwner(p.ownerToken); break;
      case 'getPortfolioData': data=getPortfolioData(p.ownerToken); break;
      case 'saveProfile': data=saveProfile(p.ownerToken,p.data); break;
      case 'saveProfilePhoto': data=saveProfilePhoto(p.ownerToken,p.croppedData); break;
      case 'uploadWork': data=uploadWork(p.ownerToken,p.title,p.description,p.dataUrl,p.fileName); break;
      case 'deleteWork': data=deleteWork(p.ownerToken,p.id); break;
      case 'addComment': data=addComment(p.name,p.message); break;
      case 'moderateComment': data=moderateComment(p.ownerToken,p.id,p.status); break;
      default: throw new Error('Perintah API tidak dikenal.');
    }
    return json_({success:true,data:data});
  } catch(err) {
    return json_({success:false,error:err.message||String(err)});
  }
}
