from typing import List, Optional
from sqlalchemy.orm import Session
from ..models.account import Account
from ..models.financial_year import FiscalYear, FiscalPeriod
from ..schemas.account import AccountCreate, AccountUpdate
from ..schemas.financial_year import FiscalYearCreate


class AccountRepository:
    def __init__(self, db: Session):
        self.db = db

    # ================= Accounts =================
    def get_account_by_id(self, account_id: int) -> Optional[Account]:
        return self.db.query(Account).filter(Account.account_id == account_id).first()

    def get_account_by_code(self, company_id: int, account_code: str) -> Optional[Account]:
        return (
            self.db.query(Account)
            .filter(Account.company_id == company_id, Account.account_code == account_code.upper())
            .first()
        )

    def list_accounts(self, company_id: int) -> List[Account]:
        return (
            self.db.query(Account)
            .filter(Account.company_id == company_id)
            .order_by(Account.account_code.asc())
            .all()
        )

    def create_account(self, data: AccountCreate, created_by: str = "ADMIN") -> Account:
        account = Account(
            company_id=data.company_id,
            account_code=data.account_code,
            account_name=data.account_name,
            account_type=data.account_type,
            opening_balance=data.opening_balance or 0.0,
            current_balance=data.opening_balance or 0.0,
            created_by=created_by,
            updated_by=created_by,
        )
        self.db.add(account)
        self.db.commit()
        self.db.refresh(account)
        return account

    # ================= Fiscal Years & Periods =================
    def get_fiscal_year(self, fiscal_year_id: int) -> Optional[FiscalYear]:
        return self.db.query(FiscalYear).filter(FiscalYear.fiscal_year_id == fiscal_year_id).first()

    def list_fiscal_years(self, company_id: int) -> List[FiscalYear]:
        return (
            self.db.query(FiscalYear)
            .filter(FiscalYear.company_id == company_id)
            .order_by(FiscalYear.start_date.desc())
            .all()
        )

    def create_fiscal_year_with_periods(self, data: FiscalYearCreate) -> FiscalYear:
        # Create fiscal year
        fy = FiscalYear(
            company_id=data.company_id,
            year_name=data.year_name,
            start_date=data.start_date,
            end_date=data.end_date,
            is_active=True,
        )
        self.db.add(fy)
        self.db.flush()

        # Automatically generate 12 monthly financial periods
        month_names = [
            "April", "May", "June", "July", "August", "September",
            "October", "November", "December", "January", "February", "March"
        ]
        import calendar
        from datetime import date

        cur_year = data.start_date.year
        for idx, m_name in enumerate(month_names, start=1):
            m_num = (idx + 3) if (idx + 3) <= 12 else (idx - 9)
            y = cur_year if idx <= 9 else cur_year + 1
            last_day = calendar.monthrange(y, m_num)[1]
            p_start = date(y, m_num, 1)
            p_end = date(y, m_num, last_day)

            period = FiscalPeriod(
                fiscal_year_id=fy.fiscal_year_id,
                period_number=idx,
                period_name=f"{m_name} {y}",
                start_date=p_start,
                end_date=p_end,
                status="OPEN",
            )
            self.db.add(period)

        self.db.commit()
        self.db.refresh(fy)
        return fy

    def get_period_by_id(self, period_id: int) -> Optional[FiscalPeriod]:
        return self.db.query(FiscalPeriod).filter(FiscalPeriod.period_id == period_id).first()

    def update_period_status(self, period_id: int, status: str) -> Optional[FiscalPeriod]:
        period = self.get_period_by_id(period_id)
        if period:
            period.status = status
            self.db.commit()
            self.db.refresh(period)
        return period

