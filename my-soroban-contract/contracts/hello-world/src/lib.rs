#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, Env, token
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum EscrowError {
    AlreadyDeposited = 1,
    NotAuthorized = 2,
    InvalidState = 3,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Tenant,
    Landlord,
    State,
    Amount,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum EscrowState {
    Uninitialized,
    Locked,
    Released,
    Refunded,
}

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    pub fn deposit(
        env: Env,
        tenant: Address,
        landlord: Address,
        token: Address,
        amount: i128,
    ) -> Result<(), EscrowError> {
        tenant.require_auth();

        let state = env
            .storage()
            .instance()
            .get::<_, EscrowState>(&DataKey::State)
            .unwrap_or(EscrowState::Uninitialized);

        if state == EscrowState::Locked {
            return Err(EscrowError::AlreadyDeposited);
        }

        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&tenant, &env.current_contract_address(), &amount);

        env.storage().instance().set(&DataKey::Tenant, &tenant);
        env.storage().instance().set(&DataKey::Landlord, &landlord);
        env.storage().instance().set(&DataKey::Amount, &amount);
        env.storage().instance().set(&DataKey::State, &EscrowState::Locked);

        env.events().publish(
            (symbol_short!("escrow"), symbol_short!("deposit")),
            (tenant.clone(), landlord.clone(), amount),
        );

        Ok(())
    }

    pub fn release(env: Env, landlord: Address, token: Address) -> Result<(), EscrowError> {
        landlord.require_auth();

        let state = env
            .storage()
            .instance()
            .get::<_, EscrowState>(&DataKey::State)
            .unwrap_or(EscrowState::Uninitialized);

        if state != EscrowState::Locked {
            return Err(EscrowError::InvalidState);
        }

        let stored_landlord = env
            .storage()
            .instance()
            .get::<_, Address>(&DataKey::Landlord)
            .unwrap();

        if landlord != stored_landlord {
            return Err(EscrowError::NotAuthorized);
        }

        let amount = env
            .storage()
            .instance()
            .get::<_, i128>(&DataKey::Amount)
            .unwrap();

        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&env.current_contract_address(), &landlord, &amount);

        env.storage().instance().set(&DataKey::State, &EscrowState::Released);

        env.events().publish(
            (symbol_short!("escrow"), symbol_short!("release")),
            landlord,
        );

        Ok(())
    }

    pub fn refund(env: Env, landlord: Address, token: Address) -> Result<(), EscrowError> {
        landlord.require_auth();

        let state = env
            .storage()
            .instance()
            .get::<_, EscrowState>(&DataKey::State)
            .unwrap_or(EscrowState::Uninitialized);

        if state != EscrowState::Locked {
            return Err(EscrowError::InvalidState);
        }

        let stored_landlord = env
            .storage()
            .instance()
            .get::<_, Address>(&DataKey::Landlord)
            .unwrap();

        if landlord != stored_landlord {
            return Err(EscrowError::NotAuthorized);
        }

        let tenant = env
            .storage()
            .instance()
            .get::<_, Address>(&DataKey::Tenant)
            .unwrap();

        let amount = env
            .storage()
            .instance()
            .get::<_, i128>(&DataKey::Amount)
            .unwrap();

        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&env.current_contract_address(), &tenant, &amount);

        env.storage().instance().set(&DataKey::State, &EscrowState::Refunded);

        env.events().publish(
            (symbol_short!("escrow"), symbol_short!("refund")),
            tenant,
        );

        Ok(())
    }

    /// Returns the current escrow state as a u32:
    /// 0 = Uninitialized, 1 = Locked, 2 = Released, 3 = Refunded
    pub fn get_status(env: Env) -> u32 {
        let state = env
            .storage()
            .instance()
            .get::<_, EscrowState>(&DataKey::State)
            .unwrap_or(EscrowState::Uninitialized);
        match state {
            EscrowState::Uninitialized => 0,
            EscrowState::Locked => 1,
            EscrowState::Released => 2,
            EscrowState::Refunded => 3,
        }
    }

    /// Returns the locked deposit amount, or 0 if no deposit exists
    pub fn get_amount(env: Env) -> i128 {
        env.storage()
            .instance()
            .get::<_, i128>(&DataKey::Amount)
            .unwrap_or(0)
    }
}

mod test;
