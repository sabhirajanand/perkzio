import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'otp_challenges' })
@Index(['phoneE164', 'purpose'])
@Index(['email', 'purpose'])
export class OtpChallenge {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'phone_e164', type: 'varchar', length: 32 })
  phoneE164!: string;

  @Column({ name: 'email', type: 'citext', nullable: true })
  email!: string | null;

  @Column({ type: 'varchar', length: 64 })
  purpose!: string;

  @Column({ name: 'code_hash', type: 'varchar', length: 255, nullable: true })
  codeHash!: string | null;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt!: Date | null;

  @Column({ name: 'consumed_at', type: 'timestamptz', nullable: true })
  consumedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
