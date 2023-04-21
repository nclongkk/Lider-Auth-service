import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import * as mongoose from 'mongoose';

import { ROLE } from '../../modules/user/constants/roles.constant';
import { SIGN_UP_TRACKING_PROVIDER } from '../../modules/user/constants/sign-up-tracking-provider.constant';
import { USER_STATUS } from '../../modules/user/constants/user-status.constant';

export type UserDocument = mongoose.HydratedDocument<User>;

@Schema({ _id: false })
export class SignupTracking {
  @Prop({ type: String })
  userAgent?: string;

  @Prop({ type: String })
  ip: string;

  @Prop({ type: String })
  countryCode?: string;

  @Prop({ type: String })
  countryName?: string;

  @Prop({ type: Date })
  trackingAt: Date;

  @Prop({ type: String, enum: SIGN_UP_TRACKING_PROVIDER })
  provider: string;
}
export const SignupTrackingSchema =
  SchemaFactory.createForClass(SignupTracking);

@Schema({ timestamps: true })
export class User {
  _id?: mongoose.Types.ObjectId | string;

  @Prop({ required: true })
  fullName: string;

  @ApiProperty({ type: String })
  @Prop({
    required: false,
    maxlength: 320,
    unique: true,
    type: String,
    lowercase: true,
    trim: true,
  })
  email?: string;

  @Prop({ required: true })
  password: string;

  @ApiProperty({ type: USER_STATUS })
  @Prop({ type: String, enum: USER_STATUS, default: USER_STATUS.ACTIVE })
  status: USER_STATUS;

  @ApiProperty({ type: String })
  @Prop({ type: String })
  resetTokenCode?: string;

  @ApiProperty({ enum: ROLE, type: String })
  @Prop({ type: String, default: ROLE.USER, enum: ROLE })
  role?: ROLE;

  @ApiProperty({ type: String })
  @Prop({ type: String })
  avatar?: string;

  @ApiProperty({ type: String })
  @Prop({ type: String, trim: true, maxlength: 100 })
  googleId?: string;

  @ApiProperty({ type: String })
  @Prop({ type: String, maxlength: 100, trim: true })
  fbId?: string;

  @ApiProperty({ type: Object })
  @Prop({ type: SignupTrackingSchema })
  signupTracking: SignupTracking;

  @ApiProperty({ type: Date })
  @Prop({ type: Date })
  lastActive: Date;
}

const schema = SchemaFactory.createForClass(User);
schema.index({ email: 1 }, { unique: true, sparse: true });
schema.index({ googleId: 1 }, { unique: true, sparse: true });
schema.index({ fbId: 1 }, { unique: true, sparse: true });

export const UserSchema = schema;
