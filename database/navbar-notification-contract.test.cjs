const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const projectRoot = path.resolve(__dirname, '..');

function readProjectFile(...segments) {
    return fs.readFileSync(path.join(projectRoot, ...segments), 'utf8');
}

function getSqlFunction(source, functionName) {
    const escapedName = functionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = source.match(new RegExp(
        `CREATE\\s+OR\\s+REPLACE\\s+FUNCTION\\s+public\\.${escapedName}\\s*\\([\\s\\S]*?\\n\\$\\$;`,
        'i'
    ));

    assert.ok(match, `SQL must define public.${functionName}().`);
    return match[0];
}

const navbar = readProjectFile('components', 'navbar.html');
const styles = readProjectFile('assets', 'css', 'style.css');
const mainSource = readProjectFile('assets', 'js', 'main.js');
const controllerPath = path.join(projectRoot, 'assets', 'js', 'notifications.js');
const migration = readProjectFile('database', 'enable-notifications.sql');
const schema = readProjectFile('database', 'create-table.sql');

assert.ok(
    fs.existsSync(controllerPath),
    'assets/js/notifications.js must contain the persistent navbar notification controller.'
);
const controllerSource = fs.readFileSync(controllerPath, 'utf8');

// ---------------------------------------------------------------------------
// Navbar markup and accessibility
// ---------------------------------------------------------------------------

const authStatusIndex = navbar.indexOf('id="auth-status"');
const notificationNavIndex = navbar.indexOf('id="notification-nav"');
assert.ok(authStatusIndex >= 0, 'Navbar must retain the signed-in user area.');
assert.ok(
    notificationNavIndex > authStatusIndex,
    'The notification bell must be immediately after the user area in navbar source order.'
);
assert.match(
    navbar,
    /id="notification-nav"[^>]*\bhidden\b/,
    'Notification center must remain hidden until an authenticated user is resolved.'
);
assert.match(
    navbar,
    /data-notification-trigger/,
    'Navbar must expose the notification trigger hook.'
);
assert.match(
    navbar,
    /data-notification-trigger[\s\S]*?aria-expanded="false"[\s\S]*?aria-controls="notification-panel"/,
    'Bell trigger must expose expanded and controlled-panel ARIA state.'
);
assert.ok(
    /data-notification-trigger[\s\S]*?aria-haspopup="true"/.test(navbar)
        || /setAttribute\(\s*['"]aria-haspopup['"]\s*,\s*['"]true['"]\s*\)/.test(controllerSource),
    'Bell trigger must expose its popup semantics in markup or during controller binding.'
);
assert.match(
    navbar,
    /data-notification-dot[\s\S]*?aria-hidden="true"[\s\S]*?\bhidden\b/,
    'Unread red dot must start hidden and stay decorative to assistive technology.'
);
assert.match(
    navbar,
    /id="notification-panel"[\s\S]*?data-notification-panel[\s\S]*?aria-label="[^"]+"[\s\S]*?\bhidden\b/,
    'Notification panel must have a label, stable hook, and hidden initial state.'
);
assert.match(
    navbar,
    /data-notification-status/,
    'Bell must expose screen-reader status text for the unread count.'
);
assert.match(
    navbar,
    /data-notification-list[\s\S]*?aria-live="polite"[\s\S]*?aria-busy="true"/,
    'Notification list must announce asynchronous updates without interrupting users.'
);
assert.match(
    navbar,
    /data-notification-mark-all/,
    'Panel must expose an explicit mark-all-read action.'
);

// ---------------------------------------------------------------------------
// Responsive visual contract
// ---------------------------------------------------------------------------

assert.match(
    styles,
    /\.notification-nav\s*\{[\s\S]*?position:\s*relative/,
    'Notification nav item must establish the dropdown positioning context.'
);
assert.match(
    styles,
    /\.notification-trigger\s*\{[\s\S]*?border-radius:\s*(?:50%|999(?:px|rem))/,
    'Bell trigger must be a compact circular control.'
);
assert.match(
    styles,
    /\.notification-unread-dot\s*\{[\s\S]*?position:\s*absolute[\s\S]*?background(?:-color)?:\s*(?:#(?:e|f)[0-9a-f]{5}|red|rgb\()/i,
    'Unread indicator must be an absolutely positioned red dot.'
);
assert.match(
    styles,
    /\.notification-unread-dot\[hidden\][\s\S]{0,260}?\{[\s\S]*?display:\s*none/,
    'Hidden notification UI must not occupy navbar space.'
);
assert.match(
    styles,
    /\.notification-panel\s*\{[\s\S]*?position:\s*absolute[\s\S]*?z-index:\s*\d+[\s\S]*?(?:width|max-width):/,
    'Desktop notification panel must be a layered, width-constrained dropdown.'
);
assert.match(
    styles,
    /\.notification-list\s*\{[\s\S]*?(?:max-height|overflow-y):/,
    'Long notification lists must scroll inside the panel.'
);
assert.match(
    styles,
    /\.notification-item(?:\.is-unread|\[data-unread)/,
    'Unread notification rows must have a distinct visual state.'
);
assert.match(
    styles,
    /\.notification-(?:trigger|mark-all)[^{]*:focus-visible/,
    'Keyboard focus on notification controls must be visible.'
);
assert.match(
    styles,
    /\.notification-visually-hidden\s*\{/,
    'Unread screen-reader text must use a reusable visually-hidden utility.'
);
assert.match(
    styles,
    /@media\s*\(max-width:\s*\d+px\)\s*\{[\s\S]*?\.notification-panel\s*\{[\s\S]*?(?:position:\s*fixed|width:\s*(?:auto|calc|min))/,
    'Notification panel must fit small mobile viewports.'
);

// ---------------------------------------------------------------------------
// Controller loading and browser behavior
// ---------------------------------------------------------------------------

assert.match(
    mainSource,
    /assets\/js\/notifications\.js/,
    'main.js must load the notification controller on every page using the shared navbar.'
);
assert.match(
    mainSource,
    /TechnoNotifications[\s\S]*?\.init\s*\(/,
    'main.js must initialize the controller after the navbar has been injected.'
);
assert.match(
    mainSource,
    /await\s+(?:navbarReady|Promise\.all\(\[[^\]]*navbarReady[^\]]*\]\))[\s\S]{0,600}?TechnoNotifications[\s\S]*?\.init\s*\(/,
    'Controller initialization must happen after navbarReady to avoid querying absent hooks.'
);

assert.match(
    controllerSource,
    /window\.TechnoNotifications\s*=/,
    'Controller must expose one stable window.TechnoNotifications API.'
);
assert.match(
    controllerSource,
    /auth\.getUser\s*\(/,
    'Controller must resolve the authenticated user before reading notifications.'
);
assert.match(
    controllerSource,
    /auth\.onAuthStateChange\s*\(/,
    'Controller must reset notification state when the signed-in user changes.'
);
assert.match(
    controllerSource,
    /rpc\(\s*['"]list_my_notifications['"]/,
    'Controller must list notifications through the auth-scoped RPC.'
);
assert.match(
    controllerSource,
    /rpc\(\s*['"]get_my_unread_notification_count['"]/,
    'Controller must load the authoritative unread count through RPC.'
);
assert.match(
    controllerSource,
    /rpc\(\s*['"]mark_my_notification_read['"][\s\S]*?p_notification_id/,
    'A notification must be marked read through the ownership-checking RPC.'
);
assert.match(
    controllerSource,
    /rpc\(\s*['"]mark_all_my_notifications_read['"]/,
    'Mark-all must use the auth-scoped database RPC.'
);
assert.doesNotMatch(
    controllerSource,
    /\.from\(\s*['"]notifications['"]\s*\)[\s\S]{0,240}?\.(?:insert|update|delete)\s*\(/,
    'Browser code must never write notification rows directly.'
);
assert.match(
    controllerSource,
    /\.channel\s*\(/,
    'Controller must open a Supabase Realtime channel.'
);
assert.match(
    controllerSource,
    /postgres_changes[\s\S]*?event:\s*['"]\*['"][\s\S]*?schema:\s*['"]public['"][\s\S]*?table:\s*['"]notifications['"]/,
    'Realtime channel must observe notification inserts and read-state updates.'
);
assert.match(
    controllerSource,
    /filter:\s*`user_id=eq\.\$\{[^}]*user[^}]*\.id\}`|filter:\s*['"]user_id=eq\.[^'"]+['"]/,
    'Realtime subscription must be scoped to the authenticated user id.'
);
assert.match(
    controllerSource,
    /removeChannel\s*\(/,
    'Controller must remove stale Realtime subscriptions on logout or reinitialization.'
);
assert.match(
    controllerSource,
    /setAttribute\(\s*['"]aria-expanded['"]/,
    'Opening and closing the panel must update aria-expanded.'
);
assert.match(
    controllerSource,
    /data-notification-dot|\[\s*['"]hidden['"]\s*\]|\.hidden\s*=/,
    'Controller must toggle the unread dot from authoritative unread state.'
);
assert.match(
    controllerSource,
    /data-notification-mark-all[\s\S]*?addEventListener\(\s*['"]click['"]/,
    'Mark-all-read must require an explicit user click.'
);
assert.match(
    controllerSource,
    /mark_my_notification_read[\s\S]*?addEventListener\(\s*['"]click['"]|addEventListener\(\s*['"]click['"][\s\S]*?mark_my_notification_read/,
    'Individual notifications must support explicit mark-as-read interaction.'
);
assert.match(
    controllerSource,
    /\.textContent\s*=/,
    'Database-provided notification text must be rendered with textContent.'
);
assert.doesNotMatch(
    controllerSource,
    /\.innerHTML\s*=/,
    'Database-provided notification data must not be interpolated through innerHTML.'
);

// Loading the controller in a minimal page must expose the API and remain safe when
// that page does not have a navbar component.
async function runControllerVmSmokeTest() {
    let rpcCallCount = 0;
    const windowListeners = new Map();
    const documentListeners = new Map();
    const sandboxWindow = {
        addEventListener(type, listener) {
            windowListeners.set(type, listener);
        },
        removeEventListener(type) {
            windowListeners.delete(type);
        },
        supabaseClient: {
            auth: {
                async getUser() {
                    return { data: { user: null }, error: null };
                },
                onAuthStateChange() {
                    return {
                        data: {
                            subscription: {
                                unsubscribe() {}
                            }
                        }
                    };
                }
            },
            async rpc() {
                rpcCallCount += 1;
                return { data: null, error: null };
            },
            channel() {
                throw new Error('Guest pages must not subscribe to notifications.');
            },
            async removeChannel() {}
        }
    };
    sandboxWindow.window = sandboxWindow;

    const sandbox = {
        window: sandboxWindow,
        document: {
            hidden: false,
            addEventListener(type, listener) {
                documentListeners.set(type, listener);
            },
            removeEventListener(type) {
                documentListeners.delete(type);
            },
            getElementById() {
                return null;
            },
            querySelector() {
                return null;
            },
            createElement() {
                return {};
            }
        },
        console: {
            log() {},
            warn() {},
            error() {}
        },
        Intl,
        URL,
        setTimeout,
        clearTimeout
    };

    vm.runInNewContext(controllerSource, sandbox, {
        filename: 'assets/js/notifications.js'
    });

    assert.equal(
        typeof sandboxWindow.TechnoNotifications?.init,
        'function',
        'Controller VM must expose TechnoNotifications.init().'
    );
    await sandboxWindow.TechnoNotifications.init();
    assert.equal(rpcCallCount, 0, 'Guest or navbar-less pages must not call notification RPCs.');
}

// ---------------------------------------------------------------------------
// Database contract: migration and canonical full-reset schema
// ---------------------------------------------------------------------------

function assertNotificationDatabaseContract(sql, label) {
    assert.match(
        sql,
        /CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+public\.notifications\s*\(/i,
        `${label} must create public.notifications.`
    );

    [
        'user_id',
        'type',
        'title',
        'message',
        'order_id',
        'metadata',
        'dedupe_key',
        'read_at',
        'created_at'
    ].forEach(column => {
        assert.match(
            sql,
            new RegExp(`\\b${column}\\b`, 'i'),
            `${label} notifications must contain ${column}.`
        );
    });

    [
        'order_created',
        'order_approved',
        'order_completed',
        'order_cancelled',
        'payment_succeeded',
        'admin_new_order',
        'admin_order_cancelled'
    ].forEach(type => {
        assert.match(
            sql,
            new RegExp(`'${type}'`, 'i'),
            `${label} must reserve notification type ${type}.`
        );
    });

    assert.match(
        sql,
        /UNIQUE\s*\(\s*user_id\s*,\s*dedupe_key\s*\)/i,
        `${label} must enforce recipient-scoped notification idempotency.`
    );
    assert.match(
        sql,
        /ON\s+CONFLICT\s*\(\s*user_id\s*,\s*dedupe_key\s*\)\s+DO\s+NOTHING/i,
        `${label} event fan-out must be retry safe.`
    );
    assert.match(
        sql,
        /ALTER\s+TABLE\s+public\.notifications\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/i,
        `${label} must enable RLS for notifications.`
    );
    assert.match(
        sql,
        /CREATE\s+POLICY[\s\S]*?ON\s+public\.notifications[\s\S]*?FOR\s+SELECT[\s\S]*?USING\s*\(\s*user_id\s*=\s*auth\.uid\(\)\s*\)/i,
        `${label} must allow users to read only their own notifications.`
    );
    assert.match(
        sql,
        /REVOKE\s+ALL\s+ON\s+public\.notifications\s+FROM\s+PUBLIC\s*,\s*anon\s*,\s*authenticated/i,
        `${label} must remove client write privileges before granting read access.`
    );
    assert.match(
        sql,
        /GRANT\s+SELECT\s+ON\s+public\.notifications\s+TO\s+authenticated/i,
        `${label} must grant authenticated users read-only table access.`
    );
    assert.doesNotMatch(
        sql,
        /GRANT\s+[^;]*(?:INSERT|UPDATE|DELETE)[^;]*ON\s+public\.notifications\s+TO\s+(?:authenticated|anon)/i,
        `${label} must never grant notification writes to browser roles.`
    );

    const triggerFunction = getSqlFunction(sql, 'create_order_notifications');
    assert.match(triggerFunction, /SECURITY\s+DEFINER/i, `${label} event trigger must write securely.`);
    assert.match(triggerFunction, /IF\s+TG_OP\s*=\s*'INSERT'/i, `${label} must distinguish new orders.`);
    assert.match(triggerFunction, /'order_created'/i, `${label} checkout must create an order-created event.`);
    assert.match(triggerFunction, /'admin_new_order'/i, `${label} new orders must notify administrators.`);
    assert.match(
        triggerFunction,
        /NEW\.status\s+IS\s+NOT\s+DISTINCT\s+FROM\s+OLD\.status/i,
        `${label} must ignore no-op status updates.`
    );
    assert.match(
        triggerFunction,
        /WHEN\s+'processing'[\s\S]*?'order_approved'/i,
        `${label} pending-to-processing semantics must notify that admin approved the order.`
    );
    assert.match(
        triggerFunction,
        /WHEN\s+'completed'[\s\S]*?'order_completed'/i,
        `${label} processing-to-completed semantics must notify order completion.`
    );
    assert.match(
        triggerFunction,
        /WHEN\s+'cancelled'[\s\S]*?'order_cancelled'/i,
        `${label} pending-to-cancelled semantics must notify cancellation.`
    );
    assert.match(
        triggerFunction,
        /NEW\.status\s*=\s*'cancelled'[\s\S]*?'admin_order_cancelled'/i,
        `${label} administrators must be notified when an order is cancelled.`
    );
    assert.doesNotMatch(
        triggerFunction,
        /'payment_succeeded'/i,
        `${label} must reserve payment_succeeded without faking payment from an order transition.`
    );
    assert.match(
        sql,
        /CREATE\s+TRIGGER\s+create_order_notifications\s+AFTER\s+INSERT\s+OR\s+UPDATE\s+OF\s+status\s+ON\s+public\.orders/i,
        `${label} must observe committed order lifecycle writes after the state guard.`
    );

    const listFunction = getSqlFunction(sql, 'list_my_notifications');
    const countFunction = getSqlFunction(sql, 'get_my_unread_notification_count');
    const markOneFunction = getSqlFunction(sql, 'mark_my_notification_read');
    const markAllFunction = getSqlFunction(sql, 'mark_all_my_notifications_read');

    [listFunction, countFunction, markOneFunction, markAllFunction].forEach((block, index) => {
        assert.match(block, /SECURITY\s+DEFINER/i, `${label} notification RPC ${index + 1} must be definer-secured.`);
        assert.match(block, /auth\.uid\(\)/i, `${label} notification RPC ${index + 1} must derive its user from JWT.`);
        assert.match(
            block,
            /current_user_id\s+IS\s+NULL[\s\S]*?Authentication required/i,
            `${label} notification RPC ${index + 1} must reject guests.`
        );
    });

    assert.match(
        listFunction,
        /WHERE\s+notification\.user_id\s*=\s*current_user_id/i,
        `${label} list RPC must scope rows to the caller.`
    );
    assert.match(
        countFunction,
        /notification\.user_id\s*=\s*current_user_id[\s\S]*?notification\.read_at\s+IS\s+NULL/i,
        `${label} unread count must be caller scoped and based on read_at.`
    );
    assert.match(
        markOneFunction,
        /notification\.id\s*=\s*p_notification_id[\s\S]*?notification\.user_id\s*=\s*current_user_id/i,
        `${label} mark-one RPC must enforce ownership in its UPDATE.`
    );
    assert.match(
        markAllFunction,
        /notification\.user_id\s*=\s*current_user_id[\s\S]*?notification\.read_at\s+IS\s+NULL/i,
        `${label} mark-all RPC must affect only the caller's unread rows.`
    );

    [
        'list_my_notifications\\(INTEGER\\)',
        'get_my_unread_notification_count\\(\\)',
        'mark_my_notification_read\\(UUID\\)',
        'mark_all_my_notifications_read\\(\\)'
    ].forEach(signature => {
        assert.match(
            sql,
            new RegExp(`GRANT\\s+EXECUTE\\s+ON\\s+FUNCTION\\s+public\\.${signature}\\s+TO\\s+authenticated`, 'i'),
            `${label} must grant authenticated execution for public.${signature}.`
        );
    });

    assert.match(
        sql,
        /ALTER\s+PUBLICATION\s+supabase_realtime\s+ADD\s+TABLE\s+public\.notifications/i,
        `${label} must publish notification changes for the navbar Realtime channel.`
    );

    if (/CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.checkout_cart\s*\(/i.test(sql)) {
        const checkoutFunction = getSqlFunction(sql, 'checkout_cart');
        assert.doesNotMatch(
            checkoutFunction,
            /payment_succeeded/i,
            `${label} checkout_cart must not claim payment succeeded without a payment provider webhook.`
        );
    }
}

assertNotificationDatabaseContract(migration, 'Incremental notification migration');
assertNotificationDatabaseContract(schema, 'Canonical create-table.sql');
assert.match(
    schema,
    /DROP\s+TABLE\s+IF\s+EXISTS\s+public\.notifications\s+CASCADE/i,
    'Full-reset schema must drop notifications before rebuilding dependent order/user tables.'
);

runControllerVmSmokeTest()
    .then(() => {
        console.log('navbar-notification-contract: markup, controller, realtime, RPC and SQL lifecycle passed');
    })
    .catch(error => {
        console.error(error);
        process.exitCode = 1;
    });
