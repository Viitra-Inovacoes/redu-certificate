import { Certificate } from 'src/certificates/entities/certificate.entity';
import { Client } from 'src/client/entities/client.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';

@Entity({ name: 'users' })
@Index(['reduUserId', 'clientId'], { unique: true })
export class User {
  @PrimaryColumn('uuid', { default: () => 'uuidv7()' })
  id: string;

  @ManyToOne(() => Client, (client) => client.users)
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column('uuid')
  clientId: string;

  @OneToMany(() => Certificate, (certificate) => certificate.user)
  certificates: Certificate[];

  @Column('integer')
  reduUserId: number;

  @Column('varchar')
  name: string;

  @Column('varchar', { nullable: true })
  cpf: string;

  @Column('varchar', { nullable: true })
  email: string;

  @Column('varchar', { nullable: true })
  description: string;

  @Column('varchar', { nullable: true })
  avatar: string;
}
