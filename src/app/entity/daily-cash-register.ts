
export class DailyCashRegister{
  id?: string;
  caissierId?: string;
  caissierName?: string;
  operationDate?: string;
  startingBalance?: number;
  totalDeposits?: number;
  totalWithdrawals?: number;
  endingBalance?: number;
  numberOfTransactions?: number;
  isClosed?: boolean;
  creationTimestamp?: Date;
  lastUpdateTimestamp?: Date;
}
