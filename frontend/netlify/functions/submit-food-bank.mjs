// ============================================================================
// NETLIFY FUNCTION: submit-food-bank.js
// ============================================================================
// PURPOSE: Securely receives form data from the frontend, validates it,
//          and forwards it to Strapi's API.
// LOCATION: Must be in netlify/functions/ folder (root level, not in src/)
// URL: /.netlify/functions/submit-food-bank (matches filename without .js)
// ============================================================================

//import zod schema

import { formSchema } from '@/shared/schema.js'


// Export the handler function that Netlify will call on each request
exports.handler = async (event, context) => {
  console.log("FUNCTION HIT");
  // --------------------------------------------------------------------------
  // STEP 1: HTTP METHOD VALIDATION
  // --------------------------------------------------------------------------
  // Why: Prevents accidental GET requests or malicious DELETE/PUT attempts
  // Security: Only POST should ever reach this function
  // --------------------------------------------------------------------------
    if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204, // No Content
      headers: {
        'Access-Control-Allow-Origin': '*', // Or your frontend URL
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    };
  }

  // Existing POST check here...
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Allow': 'POST, OPTIONS',
        'Access-Control-Allow-Origin': '*',
        
      },
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    // ------------------------------------------------------------------------
    // STEP 2: PARSE INCOMING REQUEST BODY
    // ------------------------------------------------------------------------
    // Why: The browser sends JSON, but Netlify passes it as a string
    // Note: If parsing fails, the catch block at the end will handle it
    // ------------------------------------------------------------------------
    const payload = JSON.parse(event.body);

    // ------------------------------------------------------------------------
    // STEP 3: EXTRACT FORM FIELDS FROM PAYLOAD
    // ------------------------------------------------------------------------
    // Why: Your React form sends a flat object { name, email, phone... }
    //      We extract these to validate and then repackage for Strapi
    // Note: Fields marked with ? are optional (note in this case)
    // ------------------------------------------------------------------------
/*     const { 
      name, email, phone, note, seating, time, partySize } = payload;

 */    // ------------------------------------------------------------------------
    // STEP 4: VALIDATE REQUIRED FIELDS USING THE SAME FORM SCHEMA
    // ------------------------------------------------------------------------
    // Why: Prevents empty submissions from reaching Strapi
    // Security: Reduces spam and malformed data in your database
    // Note: We check for falsy values (empty strings, null, undefined)
    // ------------------------------------------------------------------------

    const validation = formSchema.safeParse(payload);

    if (!validation.success) {
      const firstError = validation.error.errors[0]?.message || 'Validation failed';
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: firstError }),
      };
    }
  
    const { name, email, phone, note, reservationSlots, partySize } = validation.data;

    // ------------------------------------------------------------------------
    // STEP 8: PREPARE DATA FOR STRAPI
    // ------------------------------------------------------------------------
    // Why: Strapi v4/v5 API expects a specific nested structure
    // Format: { data: { field1: value1, field2: value2, ... } }
    // Note: note is optional, so we provide empty string if undefined
    // ------------------------------------------------------------------------
    const strapiData = {
      data: {
        name,
        email,
        phone,
        note: note || '', // Default to empty string if note is undefined
        reservationSlots,
        partySize,
      },
    };

    // ------------------------------------------------------------------------
    // STEP 9: LOAD ENVIRONMENT VARIABLES
    // ------------------------------------------------------------------------
    // Why: Secrets (API tokens, URLs) should NEVER be in code
    // Security: These are injected by Netlify at runtime, not stored in repo
    // Note: process.env is available in serverless functions but NOT in browser
    // ------------------------------------------------------------------------
    const strapiUrl = process.env.STRAPI_URL;
    const strapiToken = process.env.STRAPI_FORM_TOKEN;


    //Why are the variables so low here...
    
/* export async function submitReservation(formData: object) {
  const response = await fetch(`${STRAPI_URL}/api/food-bank-reservation-forms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${STRAPI_TOKEN}`,
    },
    body: JSON.stringify({ data: formData }),
  });

  if (!response.ok) {
    throw new Error(`Reservation submission failed: ${response.status}`);
  }

  return response.json();
} */

    // ------------------------------------------------------------------------
    // STEP 10: VERIFY ENVIRONMENT VARIABLES EXIST
    // ------------------------------------------------------------------------
    // Why: If these are missing, the function will fail silently
    // Security: Prevents accidental exposure of misconfigured secrets
    // Note: Log to console (visible in Netlify function logs, not public)
    // ------------------------------------------------------------------------
    if (!strapiUrl || !strapiToken) {
      console.error('Missing Strapi environment variables');
      return {
        statusCode: 500, // HTTP 500 = Internal Server Error
           headers: {
       'Access-Control-Allow-Origin': '*',  // <- this is important
      },
        body: JSON.stringify({ error: 'Server configuration error' }),
      };
    }

    // ------------------------------------------------------------------------
    // STEP 11: CALL STRAPI API
    // ------------------------------------------------------------------------
    // Why: This is where the actual data submission happens
    // Security: Admin token is sent server-side, never exposed to browser
    // Note: Using fetch (built-in to Node.js 18+, which Netlify uses)
    // ------------------------------------------------------------------------
    const response = await fetch(`${strapiUrl}/api/food-bank-reservation-forms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Tell Strapi we're sending JSON
        'Access-Control-Allow-Origin': '*',
        Authorization: `Bearer ${strapiToken}`, // Authenticate with Strapi
      },
      body: JSON.stringify(strapiData), // Convert object to JSON string
    });

    // ------------------------------------------------------------------------
    // STEP 12: HANDLE STRAPI RESPONSE ERRORS
    // ------------------------------------------------------------------------
    // Why: Strapi might reject the request (validation, auth, rate limit)
    // Security: Don't expose Strapi's internal error messages to users
    // Note: .catch() presvents crash if Strapi returns invalid JSON
    // ------------------------------------------------------------------------
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Strapi error:', errorData); // Log for debugging
      console.error('Strapi HTTP status:', response.status);
      return {
        statusCode: response.status, // Pass through Strapi's status code
           headers: {
       'Access-Control-Allow-Origin': '*',  // <- this is important
      },
        body: JSON.stringify({ 
          error: errorData.error?.message || 'Strapi submission failed' 
        }),
      };
    }

    // ------------------------------------------------------------------------
    // STEP 13: PARSE SUCCESSFUL STRAPI RESPONSE
    // ------------------------------------------------------------------------
    // Why: We need to confirm what Strapi returned
    // Note: Strapi typically returns { data: { id, attributes, ... } }
    // ------------------------------------------------------------------------
    const result = await response.json();

    // ------------------------------------------------------------------------
    // STEP 14: RETURN SUCCESS RESPONSE TO FRONTEND
    // ------------------------------------------------------------------------
    // Why: The React form needs to know submission succeeded
    // Security: Don't expose Strapi's internal IDs or sensitive data
    // Note: statusCode 200 = OK
    // ------------------------------------------------------------------------
    return {
      statusCode: 200,
         headers: {
       'Access-Control-Allow-Origin': '*',  // <- this is important
      },
      body: JSON.stringify({ success: true, data: result.data }),
    };
  } catch (error) {
    // ------------------------------------------------------------------------
    // STEP 15: CATCH ALL UNEXPECTED ERRORS
    // ------------------------------------------------------------------------
    // Why: Prevents the function from crashing and returning generic error
    // Security: Don't expose internal error details to users (information leak)
    // Note: console.error goes to Netlify logs (private, not public)
    // ------------------------------------------------------------------------
    console.error('Function error:', error);
    return {
      statusCode: 500,
         headers: {
       'Access-Control-Allow-Origin': '*',  // <- this is important
      },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};