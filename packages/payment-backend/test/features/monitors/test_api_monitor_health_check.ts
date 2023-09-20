import PaymentAPI from "@samchon/payment-api";

export async function test_api_monitor_health_check(
    connection: PaymentAPI.IConnection,
): Promise<void> {
    await PaymentAPI.functional.monitors.health.get(connection);
}
