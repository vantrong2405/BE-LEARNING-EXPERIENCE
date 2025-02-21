import * as path from 'path';
import * as fs from 'fs';

export const UPLOAD_IMAGE_DIR = path.join('uploads', 'images');
export const UPLOAD_IMAGE_TEMP_DIR = path.join('uploads', 'images', 'temp');
export const UPLOAD_VIDEO_DIR = path.join('uploads', 'videos');
export const UPLOAD_VIDEO_TEMP_DIR = path.join('uploads', 'videos', 'temp');

export const initFolder = (pathFolderArray: string[]) => {
    pathFolderArray.forEach((folder) => {
        const uploadDir = path.resolve(folder);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
    });
};