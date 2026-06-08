alter table colleges
  add column if not exists gallery_images text[] default '{}'::text[];

alter table colleges
  add column if not exists facilities text[] default '{}'::text[];

comment on column colleges.gallery_images is 'Gallery image URLs for the college CMS';
comment on column colleges.facilities is 'Facilities available on the college campus';
