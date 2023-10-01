export const getMaxDaysOfLendingScript = `
import DustLender from 0x1829e3193c654852

pub fun main(): UInt64 {
  return DustLender.getCurrentMaxDaysOfLoan()
}

`