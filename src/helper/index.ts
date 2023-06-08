import { Types } from 'mongoose';
export const createMongoIdByTimestamp = (
  timestampInSeconds: number,
  type?: 'from-time' | 'to-time',
  timezone = 7,
) => {
  const hexSeconds = Math.floor(
    timestampInSeconds - +timezone * 60 * 60,
  ).toString(16);
  switch (true) {
    case type === 'from-time':
      return new Types.ObjectId(hexSeconds + '0000000000000000');

    case type === 'to-time':
      return new Types.ObjectId(hexSeconds + 'ffffffffffffffff');

    default:
      return new Types.ObjectId(timestampInSeconds);
  }
};
