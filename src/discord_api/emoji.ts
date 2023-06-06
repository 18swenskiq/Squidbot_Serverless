import { Role } from './role';
import { Snowflake } from './snowflake';
import { User } from './user';

export interface Emoji {
  id: Snowflake;
  name: string;
  roles?: Role[];
  user?: User;
  require_colons?: boolean;
  managed?: boolean;
  animated?: boolean;
  available?: boolean;
}
