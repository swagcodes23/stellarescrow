#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::Address as _,
    token::{StellarAssetClient, TokenClient},
    Address, Env,
};

fn setup_test() -> (Env, EscrowContractClient<'static>, Address, Address, Address, TokenClient<'static>) {
    let env = Env::default();
    env.mock_all_auths();

    // Register the escrow contract
    let contract_id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(&env, &contract_id);

    // Create test accounts
    let tenant = Address::generate(&env);
    let landlord = Address::generate(&env);

    // Create a test token (SAC - Stellar Asset Contract)
    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_address = token_contract.address();
    let token_client = TokenClient::new(&env, &token_address);
    let sac_client = StellarAssetClient::new(&env, &token_address);

    // Mint tokens to the tenant so they can deposit
    sac_client.mint(&tenant, &1_000_000_000); // 100 tokens (with 7 decimals)

    (env, client, tenant, landlord, token_address, token_client)
}

#[test]
fn test_deposit() {
    let (_env, client, tenant, landlord, token, token_client) = setup_test();
    let deposit_amount: i128 = 500_000_000; // 50 tokens

    // Deposit should succeed
    client.deposit(&tenant, &landlord, &token, &deposit_amount);

    // Verify state is Locked (1)
    assert_eq!(client.get_status(), 1);
    // Verify amount is stored correctly
    assert_eq!(client.get_amount(), deposit_amount);
    // Verify the contract holds the tokens
    assert_eq!(token_client.balance(&client.address), deposit_amount);
}

#[test]
fn test_double_deposit_fails() {
    let (_env, client, tenant, landlord, token, _token_client) = setup_test();
    let deposit_amount: i128 = 100_000_000;

    // First deposit should succeed
    client.deposit(&tenant, &landlord, &token, &deposit_amount);

    // Second deposit should fail with AlreadyDeposited
    let result = client.try_deposit(&tenant, &landlord, &token, &deposit_amount);
    assert!(result.is_err());
}

#[test]
fn test_release() {
    let (_env, client, tenant, landlord, token, token_client) = setup_test();
    let deposit_amount: i128 = 300_000_000;

    client.deposit(&tenant, &landlord, &token, &deposit_amount);

    // Release should transfer funds to landlord
    client.release(&landlord, &token);

    // Verify state is Released (2)
    assert_eq!(client.get_status(), 2);
    // Verify landlord received the funds
    assert_eq!(token_client.balance(&landlord), deposit_amount);
    // Verify contract no longer holds funds
    assert_eq!(token_client.balance(&client.address), 0);
}

#[test]
fn test_refund() {
    let (_env, client, tenant, landlord, token, token_client) = setup_test();
    let deposit_amount: i128 = 200_000_000;
    let initial_tenant_balance = token_client.balance(&tenant);

    client.deposit(&tenant, &landlord, &token, &deposit_amount);

    // Refund should return funds to tenant
    client.refund(&landlord, &token);

    // Verify state is Refunded (3)
    assert_eq!(client.get_status(), 3);
    // Verify tenant got their deposit back
    assert_eq!(token_client.balance(&tenant), initial_tenant_balance);
    // Verify contract no longer holds funds
    assert_eq!(token_client.balance(&client.address), 0);
}

#[test]
fn test_release_wrong_state() {
    let (_env, client, _tenant, landlord, token, _token_client) = setup_test();

    // Trying to release when no deposit exists should fail
    let result = client.try_release(&landlord, &token);
    assert!(result.is_err());
}

#[test]
fn test_get_status_uninitialized() {
    let (_env, client, _tenant, _landlord, _token, _token_client) = setup_test();

    // Before any deposit, state should be Uninitialized (0)
    assert_eq!(client.get_status(), 0);
    assert_eq!(client.get_amount(), 0);
}
