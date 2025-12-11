// netlify/functions/check-username.js
const db = require('./db');
const { validateUsername } = require('./utils/validation');

exports.handler = async function(event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
      }
    };
  }
  
  try {
    let username;
    
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);
      username = body.username;
    } else if (event.httpMethod === 'GET') {
      username = event.queryStringParameters.username;
    } else {
      return {
        statusCode: 405,
        headers: { 
          'Access-Control-Allow-Origin': '*', 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }
    
    if (!username) {
      return {
        statusCode: 400,
        headers: { 
          'Access-Control-Allow-Origin': '*', 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          success: false, 
          error: 'Username is required' 
        })
      };
    }
    
    // Validate username format
    const validation = validateUsername(username);
    if (!validation.isValid) {
      return {
        statusCode: 200,
        headers: { 
          'Access-Control-Allow-Origin': '*', 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          available: false,
          errors: validation.errors
        })
      };
    }
    
    // Check if username exists (case-insensitive)
    const result = await db.query(
      'SELECT id FROM users WHERE LOWER(username) = LOWER($1)',
      [username]
    );
    
    const isAvailable = result.rows.length === 0;
    
    return {
      statusCode: 200,
      headers: { 
        'Access-Control-Allow-Origin': '*', 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        available: isAvailable,
        username: username
      })
    };
    
  } catch (error) {
    console.error('Check username error:', error);
    return {
      statusCode: 500,
      headers: { 
        'Access-Control-Allow-Origin': '*', 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      })
    };
  }
};
