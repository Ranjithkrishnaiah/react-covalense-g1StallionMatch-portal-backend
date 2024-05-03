import { UnprocessableEntityException } from '@nestjs/common';
import { extname, join } from 'path';

export const editFileName = (req, file, callback) => {
  callback(null, `${Date.now()}${extname(file.originalname)}`);
};

export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(
      new UnprocessableEntityException('Only image files are allowed!'),
      false,
    );
  }
  callback(null, true);
};
export const csvFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(csv)$/)) {
    return callback(new Error('Only CSV files are allowed!'), false);
  }
  callback(null, true);
};
export const csvFileName = (req, file, callback) => {
  const fileExtName = extname(file.originalname);
  callback(null, `${Date.now()}${extname(file.originalname)}`);
};

export const getCSVFile = () => {
  const filePath = join(__dirname, '..', '..', 'src/uploads/Mares_List/');
  return filePath;
};
