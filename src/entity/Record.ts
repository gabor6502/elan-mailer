import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

/**
 * @name Record
 * 
 * @description Stores a record of an email sent
 */
@Entity({name: 'record'})
export class Record {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column()
    emailAddress: string

    @Column({ type: 'timestamptz' })
    dateSent: Date
}