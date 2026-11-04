from datetime import date
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field


# ==================== Accounts Payable ====================
class APInvoiceCreate(BaseModel):
    company_id: int
    vendor_name: str = Field(..., min_length=2, max_length=150)
    invoice_number: str = Field(..., min_length=2, max_length=50)
    invoice_date: date
    due_date: date
    total_amount: Decimal = Field(..., gt=0)


class APPaymentCreate(BaseModel):
    payment_amount: Decimal = Field(..., gt=0)


# ==================== Accounts Receivable ====================
class ARInvoiceCreate(BaseModel):
    company_id: int
    customer_name: str = Field(..., min_length=2, max_length=150)
    invoice_number: str = Field(..., min_length=2, max_length=50)
    invoice_date: date
    due_date: date
    total_amount: Decimal = Field(..., gt=0)


class ARPaymentCreate(BaseModel):
    receipt_amount: Decimal = Field(..., gt=0)


# ==================== Fixed Assets ====================
class FixedAssetCreate(BaseModel):
    company_id: int
    asset_code: str = Field(..., min_length=2, max_length=30)
    asset_name: str = Field(..., min_length=2, max_length=150)
    category: str = Field(..., min_length=2, max_length=100)
    purchase_date: date
    purchase_cost: Decimal = Field(..., gt=0)


class DepreciationRecord(BaseModel):
    depreciation_amount: Decimal = Field(..., gt=0)


# ==================== Budgeting ====================
class BudgetCreate(BaseModel):
    company_id: int
    fiscal_year_id: int
    account_id: int
    budgeted_amount: Decimal = Field(..., ge=0)


# ==================== GST Compliance ====================
class GSTRecordCreate(BaseModel):
    company_id: int
    transaction_ref: str
    hsn_sac: str
    taxable_value: Decimal = Field(..., gt=0)
    cgst_rate_percent: Decimal = Field(Decimal("9.0"), ge=0)
    sgst_rate_percent: Decimal = Field(Decimal("9.0"), ge=0)
    igst_rate_percent: Decimal = Field(Decimal("0.0"), ge=0)

