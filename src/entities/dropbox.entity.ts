import { Entity, Unique, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IDropbox } from '../models/dropbox.model';

@Entity()
@Unique(['email'])
export class Dropbox implements IDropbox {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 250, nullable: false, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 250, nullable: false })
    password: string;
}
