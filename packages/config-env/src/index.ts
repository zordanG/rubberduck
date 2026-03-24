import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.normalize('../../.env'),
  quiet: true,
});
