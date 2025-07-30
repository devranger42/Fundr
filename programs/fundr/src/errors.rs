use anchor_lang::prelude::*;

#[error_code]
pub enum FundrError {
    #[msg("Fund name is too long (max 50 characters)")]
    NameTooLong,
    
    #[msg("Fund description is too long (max 200 characters)")]
    DescriptionTooLong,
    
    #[msg("Manager fee is too high (max 20%)")]
    ManagerFeeTooHigh,
    
    #[msg("Too many token allocations (max 10)")]
    TooManyAllocations,
    
    #[msg("Invalid allocation percentage (total must be <= 100%)")]
    InvalidAllocation,
    
    #[msg("Invalid amount (must be greater than 0)")]
    InvalidAmount,
    
    #[msg("Fund is not active")]
    FundInactive,
    
    #[msg("Insufficient shares for withdrawal")]
    InsufficientShares,
    
    #[msg("Insufficient fund balance for withdrawal")]
    InsufficientFundBalance,
    
    #[msg("Unauthorized operation")]
    Unauthorized,
    
    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,
    
    #[msg("Invalid fund type")]
    InvalidFundType,
    
    #[msg("Swap execution failed")]
    SwapFailed,
    
    #[msg("Invalid token mint")]
    InvalidTokenMint,
}