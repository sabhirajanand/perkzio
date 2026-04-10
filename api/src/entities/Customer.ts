import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'customers' })
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'phone_e164', type: 'varchar', length: 32 })
  @Index({ unique: true })
  phoneE164!: string;

  @Column({ name: 'phone_verified_at', type: 'timestamptz', nullable: true })
  phoneVerifiedAt!: Date | null;

  @Column({ type: 'varchar', length: 32 })
  status!: string;

  @Column({ name: 'first_name', type: 'varchar', length: 255, nullable: true })
  firstName!: string | null;

  @Column({ name: 'last_name', type: 'varchar', length: 255, nullable: true })
  lastName!: string | null;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth!: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  gender!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email!: string | null;

  @Column({ name: 'profile_photo_s3_key', type: 'varchar', length: 1024, nullable: true })
  profilePhotoS3Key!: string | null;

  @Column({ name: 'preferred_language', type: 'varchar', length: 16, nullable: true })
  preferredLanguage!: string | null;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
