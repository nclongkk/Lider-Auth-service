import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import * as mongoose from 'mongoose';

import { ROLE } from '../../modules/user/constants/roles.constant';
import { SIGN_UP_TRACKING_PROVIDER } from '../../modules/user/constants/sign-up-tracking-provider.constant';
import { USER_STATUS } from '../../modules/user/constants/user-status.constant';

export type UserDocument = mongoose.HydratedDocument<User>;

@ObjectType()
@Schema({ _id: false })
export class SignupTracking {
  @Field(() => String, { nullable: true })
  @Prop({ type: String })
  userAgent?: string;

  @Field(() => String, { nullable: true })
  @Prop({ type: String })
  ip: string;

  @Field(() => String, { nullable: true })
  @Prop({ type: String })
  countryCode?: string;

  @Field(() => String, { nullable: true })
  @Prop({ type: String })
  countryName?: string;

  @Field(() => String, { nullable: true })
  @Prop({ type: Date })
  trackingAt: Date;

  @Field(() => String, { nullable: true })
  @Prop({ type: String, enum: SIGN_UP_TRACKING_PROVIDER })
  provider: string;
}
export const SignupTrackingSchema =
  SchemaFactory.createForClass(SignupTracking);

@ObjectType()
@Schema({ timestamps: true })
export class User {
  @Field(() => String)
  _id?: mongoose.Types.ObjectId | string;

  @Field()
  @Prop({ required: true })
  fullName: string;

  @Field({ nullable: true })
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

  @Field()
  @ApiProperty({ type: USER_STATUS })
  @Prop({ type: String, enum: USER_STATUS, default: USER_STATUS.ACTIVE })
  status: USER_STATUS;

  @Field({ nullable: true })
  @ApiProperty({ type: String })
  @Prop({ type: String })
  resetTokenCode?: string;

  @Field({ nullable: true })
  @ApiProperty({ enum: ROLE, type: String })
  @Prop({ type: String, default: ROLE.USER, enum: ROLE })
  role?: ROLE;

  @Field({ nullable: true })
  @ApiProperty({ type: String })
  @Prop({ type: String })
  avatar?: string;

  @Field({ nullable: true })
  @ApiProperty({ type: String })
  @Prop({ type: String, trim: true, maxlength: 100 })
  googleId?: string;

  @Field({ nullable: true })
  @ApiProperty({ type: String })
  @Prop({ type: String, maxlength: 100, trim: true })
  fbId?: string;

  @Field({ nullable: true })
  @ApiProperty({ type: Object })
  @Prop({ type: SignupTrackingSchema })
  signupTracking: SignupTracking;

  @Field()
  @ApiProperty({ type: Date })
  @Prop({ type: Date })
  lastActive: Date;
}

const schema = SchemaFactory.createForClass(User);
schema.index({ email: 1 }, { unique: true, sparse: true });
schema.index({ googleId: 1 }, { unique: true, sparse: true });
schema.index({ fbId: 1 }, { unique: true, sparse: true });

export const UserSchema = schema;
