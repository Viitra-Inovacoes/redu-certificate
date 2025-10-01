import { Client } from '../../client/entities/client.entity';
import { Template } from 'src/templates/entities/template.entity';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

export type S3KeyKind =
  | 'front'
  | 'backSmall'
  | 'backLarge'
  | 'merged'
  | 'frontBackground'
  | 'backBackground';

@Entity({ name: 'blueprints' })
export class Blueprint {
  @PrimaryColumn('uuid', { default: () => 'uuidv7()' })
  id: string;

  @Column('varchar')
  name: string;

  @OneToMany(() => Template, (template) => template.blueprint)
  templates: Template[];

  @OneToMany(() => Client, (client) => client.blueprint)
  clients: Client[];

  get folderKey() {
    return `blueprints/${this.id}`;
  }

  getS3Key(kind: S3KeyKind) {
    console.log('Blueprint getS3Key', {
      folderKey: this.folderKey,
      kind,
    });
    return `${this.folderKey}/${kind}`;
  }
}
