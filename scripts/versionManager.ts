import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

// 版本管理工具
class VersionManager {
  private versionFile: string;
  private packageFile: string;

  constructor() {
    this.versionFile = join(process.cwd(), 'src', 'version.json');
    this.packageFile = join(process.cwd(), 'package.json');
  }

  // 获取当前版本
  getCurrentVersion(): string {
    try {
      const packageData = JSON.parse(readFileSync(this.packageFile, 'utf8'));
      return packageData.version;
    } catch (error) {
      console.error('读取package.json失败:', error);
      return '1.0.0';
    }
  }

  // 生成版本信息
  generateVersionInfo(): { version: string; buildTime: string; commitHash?: string } {
    const version = this.getCurrentVersion();
    const buildTime = new Date().toISOString();
    
    // 尝试获取git commit hash
    let commitHash: string | undefined;
    try {
      commitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    } catch {
      // 如果获取失败，忽略
    }

    return {
      version,
      buildTime,
      commitHash
    };
  }

  // 写入版本文件
  writeVersionFile(): void {
    const versionInfo = this.generateVersionInfo();
    
    try {
      writeFileSync(this.versionFile, JSON.stringify(versionInfo, null, 2));
      console.log('版本文件已更新:', versionInfo);
    } catch (error) {
      console.error('写入版本文件失败:', error);
    }
  }

  // 更新缓存版本名
  updateCacheVersion(): string {
    const version = this.getCurrentVersion();
    const timestamp = Date.now();
    return `react-pwa-v${version}-${timestamp}`;
  }
}

// 如果直接运行此脚本
const versionManager = new VersionManager();
versionManager.writeVersionFile();

export default VersionManager;
