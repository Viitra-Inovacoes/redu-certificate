import { Template } from 'src/templates/entities/template.entity';
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

@Entity({ name: 'signatures' })
@Index(['templateId'], { unique: false })
export class Signature {
  @PrimaryColumn('uuid', { default: () => 'uuidv7()' })
  id: string;

  @ManyToOne(() => Template, (template) => template.signatures, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'templateId' })
  template: Template;

  @Column('uuid')
  templateId: string;

  @Column('varchar')
  name: string;

  @Column('varchar')
  role: string;

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

  getSpacesKey() {
    return `templates/${this.templateId}/signatures/${this.id}`;
  }
}
