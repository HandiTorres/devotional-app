-- Add preferred charity and milestones tracking to users table
alter table users add column preferred_charity text check (preferred_charity in ('feeding', 'water', 'bible'));
alter table users add column milestones_shown integer[] default '{}';
