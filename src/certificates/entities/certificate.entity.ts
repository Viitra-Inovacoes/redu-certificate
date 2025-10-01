import { customAlphabet } from 'nanoid';
import { Template } from 'src/templates/entities/template.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 10);

export type S3KeyFormat = 'pdf' | 'png' | 'html';
export type S3KeyOptions =
  | {
      kind: 'front' | 'back';
      format: S3KeyFormat;
    }
  | {
      kind: 'merged';
      format: 'pdf';
    };

@Entity({ name: 'certificates' })
@Index(['validationCode'], { unique: true })
@Index(['validationCode', 'templateId'], { unique: true })
@Index(['templateId', 'userId'], { unique: true })
export class Certificate {
  @PrimaryColumn('uuid', { default: () => 'uuidv7()' })
  id: string;

  @ManyToOne(() => Template, (template) => template.certificates)
  @JoinColumn({ name: 'templateId' })
  template: Template;

  @Column('uuid', { nullable: false })
  templateId: string;

  @Column('varchar', { nullable: false, unique: true })
  validationCode: string;

  @ManyToOne(() => User, (user) => user.certificates)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('uuid', { nullable: false })
  userId: string;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'now()',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'now()',
    onUpdate: 'now()',
  })
  updatedAt: Date;

  generateValidationCode() {
    this.validationCode = nanoid();
  }

  get outdated() {
    return this.template.updatedAt > this.createdAt;
  }

  get folderKey() {
    return `certificates/${this.id}`;
  }

  getS3Key(options: S3KeyOptions) {
    return `${this.folderKey}/${options.kind}.${options.format}`;
  }
}
