import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

export const MAX_CHARS = 256

/**
 * @name Record
 * 
 * @description Stores a record of an email sent
 */
@Entity({name: 'record'})
export class Record {

    @PrimaryGeneratedColumn()
    id: number

    @Column({type: 'varchar', length: MAX_CHARS})
    firstName: string

    @Column({type: 'varchar', length: MAX_CHARS})
    lastName: string

    @Column({type: 'varchar', length: MAX_CHARS})
    emailAddress: string

    @Column({ type: 'timestamptz' })
    dateSent: Date
}