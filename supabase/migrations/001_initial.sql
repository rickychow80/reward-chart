-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Settings (one row per parent user)
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stamp_goal INTEGER NOT NULL DEFAULT 10,
  theme TEXT NOT NULL DEFAULT 'bright',
  parent_pin TEXT NOT NULL DEFAULT '1234',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(parent_id)
);

-- Children profiles
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_emoji TEXT NOT NULL DEFAULT '😊',
  color TEXT NOT NULL DEFAULT '#FF6B35',
  stamp_logo_type TEXT NOT NULL DEFAULT 'emoji',
  stamp_logo_value TEXT NOT NULL DEFAULT '⭐',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tasks / behaviors stamps are awarded for
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '✅',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Stamps awarded to children
CREATE TABLE stamps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  task_name TEXT,
  awarded_at TIMESTAMPTZ DEFAULT now()
);

-- Prizes on the spin wheel
CREATE TABLE wheel_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🎁',
  color TEXT NOT NULL DEFAULT '#FF6B35',
  weight INTEGER NOT NULL DEFAULT 1,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- History of wheel spins
CREATE TABLE spin_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  wheel_item_id UUID REFERENCES wheel_items(id) ON DELETE SET NULL,
  wheel_item_label TEXT NOT NULL,
  wheel_item_emoji TEXT NOT NULL,
  spun_at TIMESTAMPTZ DEFAULT now(),
  redeemed_at TIMESTAMPTZ
);

-- Row Level Security
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE stamps ENABLE ROW LEVEL SECURITY;
ALTER TABLE wheel_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all" ON settings FOR ALL USING (parent_id = auth.uid());
CREATE POLICY "owner_all" ON children FOR ALL USING (parent_id = auth.uid());
CREATE POLICY "owner_all" ON tasks FOR ALL USING (parent_id = auth.uid());
CREATE POLICY "owner_all" ON stamps FOR ALL
  USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));
CREATE POLICY "owner_all" ON wheel_items FOR ALL USING (parent_id = auth.uid());
CREATE POLICY "owner_all" ON spin_history FOR ALL
  USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

-- Seed default tasks when parent signs up (run manually or via trigger)
-- INSERT INTO tasks (parent_id, name, icon) VALUES (auth.uid(), 'Made bed', '🛏️');
