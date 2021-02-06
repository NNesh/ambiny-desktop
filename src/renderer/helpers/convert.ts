import { BaudRate } from '../classes/types';

export function convertBaudRate(baudRate: string | BaudRate | number) {
    return (typeof baudRate === 'string') ? (Number.parseInt(baudRate) as BaudRate) : baudRate;
}
