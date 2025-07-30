# 🚀 CustomWallApp Deployment Checklist

## Database Setup

### 1. Database Schema
- [ ] Run the updated `export_database.sql` to create all tables including:
  - `users` table
  - `pending_users` table  
  - `plans` table
  - `user_plans` table
  - `drafts` table
  - `payments` table
  - `admin_flags` table
  - `user_stickers` table (for individual user stickers)
  - `plan_stickers` table (for plan-based stickers)

### 2. Database Tables Verification
```sql
-- Check if all tables exist
SHOW TABLES;

-- Verify sticker tables
DESCRIBE user_stickers;
DESCRIBE plan_stickers;

-- Check initial data
SELECT * FROM plans;
SELECT * FROM users;
```

## Backend Deployment

### 3. Backend API Endpoints
- [ ] Verify all endpoints are working:
  - `POST /api/admin/add-stickers-to-user` ✅ (existing)
  - `POST /api/admin/add-stickers-to-plan` ✅ (new)
  - `GET /api/admin/plan/:planName/stickers` ✅ (new)
  - `POST /api/admin/plan/:planName/stickers` ✅ (new)
  - `GET /api/admin/plans/list` ✅ (new)
  - `GET /api/user/:id/all-stickers` ✅ (new)

### 4. Backend Features
- [ ] User registration automatically assigns plan stickers
- [ ] Plan upgrades automatically assign new plan stickers
- [ ] Admin can assign stickers to individual users
- [ ] Admin can assign stickers to entire plans
- [ ] Plan sticker changes affect all users in that plan

## Frontend Deployment

### 5. Admin Panel Features
- [ ] Admin Dashboard navigation includes "Plan Stickers"
- [ ] AdminUsers component allows individual sticker assignment
- [ ] AdminPlanStickers component allows plan-based sticker assignment
- [ ] Plan sticker management shows user counts per plan
- [ ] Sticker selection interface works correctly

### 6. User Features
- [ ] Users can see their combined stickers (user + plan stickers)
- [ ] New users get plan stickers on registration
- [ ] Users get new stickers when upgrading plans

## Testing Checklist

### 7. Admin Testing
- [ ] Login as admin (Arvind Rathod / arvind)
- [ ] Navigate to "Plan Stickers" in admin panel
- [ ] Select a plan (basic, advanced, premium)
- [ ] Assign stickers to the plan
- [ ] Verify all users in that plan receive the stickers
- [ ] Test individual user sticker assignment in "Users" section

### 8. User Testing
- [ ] Register a new user
- [ ] Verify they receive basic plan stickers
- [ ] Upgrade user to premium plan
- [ ] Verify they receive premium plan stickers
- [ ] Check that individual stickers are preserved

### 9. API Testing
```bash
# Test plan sticker assignment
curl -X POST http://localhost:5000/api/admin/plan/premium/stickers \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"stickers": ["premium1.png", "premium2.png"]}'

# Test user sticker assignment
curl -X POST http://localhost:5000/api/admin/user/1/stickers \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"stickers": ["premium3.png"]}'

# Test getting user's complete stickers
curl -X GET http://localhost:5000/api/user/1/all-stickers \
  -H "Authorization: Bearer USER_TOKEN"
```

## Security Verification

### 10. Access Control
- [ ] Only admins can access plan sticker management
- [ ] Users can only see their own stickers
- [ ] JWT authentication working for all endpoints
- [ ] CORS properly configured

### 11. Data Integrity
- [ ] Sticker assignments are properly saved to database
- [ ] Plan changes affect all users correctly
- [ ] No duplicate stickers assigned
- [ ] Sticker removal works correctly

## Performance Testing

### 12. Load Testing
- [ ] Test with multiple users in same plan
- [ ] Verify plan sticker updates are efficient
- [ ] Check database query performance
- [ ] Monitor memory usage

## Monitoring Setup

### 13. Logging
- [ ] Backend logs sticker assignment operations
- [ ] Error handling for failed sticker assignments
- [ ] Admin actions are logged

### 14. Database Monitoring
- [ ] Monitor `user_stickers` table growth
- [ ] Monitor `plan_stickers` table usage
- [ ] Set up alerts for database issues

## Documentation

### 15. Admin Guide
- [ ] Document how to assign stickers to plans
- [ ] Document how to assign stickers to individual users
- [ ] Explain the difference between user and plan stickers

### 16. User Guide
- [ ] Explain how users get stickers
- [ ] Document plan upgrade benefits
- [ ] Show how to use stickers in wall creation

## Rollback Plan

### 17. Emergency Procedures
- [ ] Backup database before major changes
- [ ] Document rollback steps for sticker assignments
- [ ] Test rollback procedures

## Post-Deployment

### 18. Verification
- [ ] All features working in production
- [ ] No console errors
- [ ] Database queries optimized
- [ ] User experience smooth

### 19. Monitoring
- [ ] Set up alerts for errors
- [ ] Monitor user engagement with stickers
- [ ] Track plan upgrade rates

## Success Criteria

✅ **Admin can assign stickers to individual users**
✅ **Admin can assign stickers to entire plans**  
✅ **Users automatically receive plan stickers**
✅ **New users get plan stickers on registration**
✅ **Plan upgrades assign new stickers**
✅ **Individual user stickers are preserved**
✅ **Combined sticker system works correctly**

## Notes

- The system supports three user plans: basic, advanced, premium
- Stickers are stored as filenames (e.g., "premium1.png")
- Plan stickers are automatically assigned to all users in that plan
- Individual user stickers are preserved when plan stickers are assigned
- The system handles both user-specific and plan-based sticker assignments seamlessly 