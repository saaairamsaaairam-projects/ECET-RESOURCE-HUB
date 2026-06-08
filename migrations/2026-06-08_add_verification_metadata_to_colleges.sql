alter table colleges
  add column if not exists verification_status text not null default 'verified';

alter table colleges
  add column if not exists last_verified timestamptz;

alter table colleges
  add column if not exists source_url text;

comment on column colleges.verification_status is 'Data verification status for college records';
comment on column colleges.last_verified is 'When the college record was last verified';
comment on column colleges.source_url is 'Primary source URL for the college record';
