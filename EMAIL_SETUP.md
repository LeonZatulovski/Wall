# Email Setup for Marketplace

This guide shows you how to set up automatic email sending for marketplace inquiries using Supabase Edge Functions.

## Option 1: Resend (Recommended for Production)

### 1. Sign up for Resend
1. Go to [resend.com](https://resend.com)
2. Create a free account (100 emails/day free)
3. Get your API key from the dashboard

### 2. Deploy the Edge Function
1. Install Supabase CLI: `npm install -g supabase`
2. Login to Supabase: `supabase login`
3. Link your project: `supabase link --project-ref YOUR_PROJECT_ID`
4. Deploy the function: `supabase functions deploy send-marketplace-email`

### 3. Set Environment Variables
In your Supabase dashboard:
1. Go to Settings > Edge Functions
2. Add environment variable: `RESEND_API_KEY=your_resend_api_key`

### 4. Verify Your Domain (Optional but Recommended)
1. In Resend dashboard, add and verify your domain
2. Update the `from` email in the Edge Function to use your domain

## Option 2: SendGrid (Alternative)

### 1. Sign up for SendGrid
1. Go to [sendgrid.com](https://sendgrid.com)
2. Create a free account (100 emails/day free)
3. Get your API key from the dashboard

### 2. Deploy the Edge Function
Same steps as above, but use SendGrid API key instead.

### 3. Set Environment Variables
In your Supabase dashboard:
1. Go to Settings > Edge Functions
2. Add environment variable: `SENDGRID_API_KEY=your_sendgrid_api_key`

## Option 3: Gmail (Development/Testing)

### 1. Set up Gmail App Password
1. Go to your Google Account settings
2. Enable 2-factor authentication
3. Generate an App Password for "Mail"
4. Use this password instead of your regular Gmail password

### 2. Set Environment Variables
In your Supabase dashboard:
1. Go to Settings > Edge Functions
2. Add environment variables:
   - `GMAIL_USER=your_email@gmail.com`
   - `GMAIL_APP_PASSWORD=your_app_password`

## Quick Setup (No Email Service)

If you don't want to set up an email service right now:

1. Deploy the Edge Function as-is
2. It will log emails to the console instead of sending them
3. You can see the email content in the Supabase Edge Function logs

## Testing the Email Function

### 1. Test Locally
```bash
# Start Supabase locally
supabase start

# Test the function
curl -X POST http://localhost:54321/functions/v1/send-marketplace-email \
  -H "Content-Type: application/json" \
  -d '{
    "buyerName": "John Doe",
    "buyerEmail": "john@example.com",
    "sellerEmail": "seller@example.com",
    "itemTitle": "Test Item",
    "itemPrice": "$100.00",
    "message": "Is this still available?",
    "itemCategory": "Electronics",
    "itemCondition": "New",
    "itemLocation": "New York, NY"
  }'
```

### 2. Test in Production
The marketplace will automatically call the Edge Function when users submit contact forms.

## Environment Variables Summary

Add these to your Supabase Edge Functions environment:

```env
# For Resend (recommended)
RESEND_API_KEY=your_resend_api_key

# For SendGrid (alternative)
SENDGRID_API_KEY=your_sendgrid_api_key

# For Gmail (development)
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
```

## Troubleshooting

### Common Issues:

1. **Function not found**: Make sure you deployed the Edge Function
2. **CORS errors**: The function includes CORS headers, but check your domain settings
3. **Email not sending**: Check the Edge Function logs in Supabase dashboard
4. **API key errors**: Verify your email service API key is correct

### Check Logs:
1. Go to Supabase dashboard
2. Navigate to Edge Functions
3. Click on `send-marketplace-email`
4. Check the "Logs" tab for any errors

## Cost Considerations

- **Resend**: Free tier includes 100 emails/day
- **SendGrid**: Free tier includes 100 emails/day
- **Gmail**: Free but limited to 500 emails/day
- **Supabase Edge Functions**: Free tier includes 500,000 invocations/month

## Security Notes

- Never commit API keys to your repository
- Use environment variables for all sensitive data
- Consider rate limiting for the email function
- Validate email addresses on both client and server side

## Next Steps

1. Choose an email service (Resend recommended)
2. Deploy the Edge Function
3. Set up environment variables
4. Test the functionality
5. Monitor usage and logs

The marketplace will now automatically send professional emails to sellers when buyers submit inquiries! 