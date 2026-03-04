import { connect } from 'mongoose';
import { museumsSeed } from './museums.seed';
import { MuseumSchema } from '../../museums/schemas/museum.schema';
import { Model } from 'mongoose';

async function seed() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/museum-app';

  console.log('正在连接数据库...');
  console.log(`MongoDB URI: ${mongoUri}`);

  try {
    const connection = await connect(mongoUri);
    console.log('数据库连接成功');

    // 创建 Museum 模型
    const MuseumModel = connection.model('Museum', MuseumSchema);

    // 清空现有数据
    console.log('清空现有博物馆数据...');
    const deleteResult = await MuseumModel.deleteMany({});
    console.log(`已删除 ${deleteResult.deletedCount} 条记录`);

    // 导入种子数据
    console.log('开始导入博物馆数据...');
    const insertResult = await MuseumModel.insertMany(museumsSeed);
    console.log(`成功导入 ${insertResult.length} 个博物馆数据`);

    // 输出导入结果
    console.log('\n========== 导入结果 ==========');
    console.log('已导入的博物馆列表:');
    insertResult.forEach((museum, index) => {
      console.log(`${index + 1}. ${museum.name} - ${museum.city}`);
    });
    console.log('==============================\n');
    console.log('种子数据导入完成!');

    await connection.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('种子数据导入失败:', error);
    process.exit(1);
  }
}

seed();