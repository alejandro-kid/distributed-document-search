import * as fs from 'fs';
import * as path from 'path';

export class PackageVersion {
  private version: string;

  constructor() {
    const packageJsonPath = path.join(__dirname, '../../../..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    this.version = packageJson.version || '1.0.0';
  }

  get(): string {
    return this.version;
  }
}
