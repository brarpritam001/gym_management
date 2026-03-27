"""Seed script – populates the database with test data."""

from datetime import date, timedelta, datetime, timezone
from sqlmodel import Session
from app.database.session import engine, init_db
from app.models.user import User
from app.models.member import MemberProfile
from app.models.plan import MembershipPlan
from app.models.membership import Membership
from app.models.payment import Payment
from app.models.attendance import Attendance
from app.models.trainer import Trainer
from app.models.notification import Notification
from app.models.gym import Gym
from app.models.subscription_plan import SubscriptionPlan
from app.models.gym_subscription import GymSubscription
from app.core.security import hash_password


def seed():
    init_db()
    with Session(engine) as s:
        # ── SaaS Subscription Plans ──────────────────────────────
        saas_plans = [
            SubscriptionPlan(name="FREE", member_limit=10, price=0, duration_days=30, features="basic"),
            SubscriptionPlan(name="BASIC", member_limit=100, price=999, duration_days=30, features="basic,reports"),
            SubscriptionPlan(name="PRO", member_limit=500, price=2499, duration_days=30, features="basic,reports,trainers,advanced"),
            SubscriptionPlan(name="UNLIMITED", member_limit=999999, price=4999, duration_days=30, features="all"),
        ]
        s.add_all(saas_plans)
        s.commit()
        for p in saas_plans:
            s.refresh(p)

        # ── Admin user (password: admin123) ──────────────────────
        admin = User(email="admin@gym.com", full_name="Admin User", hashed_password=hash_password("admin123"))
        s.add(admin)
        s.commit()
        s.refresh(admin)

        # ── Default Gym (tenant) ─────────────────────────────────
        gym = Gym(name="FitZone Gym", owner_user_id=admin.id)
        s.add(gym)
        s.commit()
        s.refresh(gym)

        # Link admin to gym
        admin.gym_id = gym.id
        s.add(admin)
        s.commit()
        s.refresh(admin)

        # ── Assign FREE trial to the gym ─────────────────────────
        free_plan = saas_plans[0]  # FREE
        gym_sub = GymSubscription(
            gym_id=gym.id,
            plan_id=free_plan.id,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=free_plan.duration_days),
            status="trial",
        )
        s.add(gym_sub)
        s.commit()

        # ── Membership plans (predefined templates) ────────────────
        plans = [
            MembershipPlan(name="1 Month", description="30 day access", duration_days=30, price=1000),
            MembershipPlan(name="3 Months", description="90 day access", duration_days=90, price=2500),
            MembershipPlan(name="6 Months", description="180 day access", duration_days=180, price=4500),
            MembershipPlan(name="1 Year", description="365 day access", duration_days=365, price=8000),
        ]
        s.add_all(plans)
        s.commit()

        today = date.today()

        # ── Members (linked to gym, with membership info) ─────────
        members_data = [
            ("Rahul Sharma", "rahul@example.com", "9876543210", "male", "1 Month", today - timedelta(days=10), today + timedelta(days=20), 1000),
            ("Priya Patel", "priya@example.com", "9876543211", "female", "3 Months", today - timedelta(days=30), today + timedelta(days=60), 2500),
            ("Amit Kumar", "amit@example.com", "9876543212", "male", "1 Year", today - timedelta(days=100), today + timedelta(days=265), 8000),
            ("Sneha Reddy", "sneha@example.com", "9876543213", "female", "1 Month", today - timedelta(days=25), today + timedelta(days=5), 1000),
            ("Vikram Singh", "vikram@example.com", "9876543214", "male", "1 Month", today - timedelta(days=35), today - timedelta(days=5), 1000),
            ("Anjali Gupta", "anjali@example.com", "9876543215", "female", "3 Months", today - timedelta(days=5), today + timedelta(days=85), 2500),
            ("Rohit Jain", "rohit@example.com", "9876543216", "male", "", None, None, 0),
            ("Kavita Nair", "kavita@example.com", "9876543217", "female", "", None, None, 0),
        ]
        members = []
        for name, email, phone, gender, m_name, m_start, m_end, m_fee in members_data:
            m = MemberProfile(
                full_name=name, email=email, phone=phone, gender=gender, gym_id=gym.id,
                membership_name=m_name,
                membership_start_date=m_start,
                membership_end_date=m_end,
                membership_fee=m_fee,
            )
            s.add(m)
            members.append(m)
        s.commit()

        # Refresh to get IDs
        for m in members:
            s.refresh(m)
        for p in plans:
            s.refresh(p)

        # ── Memberships ──────────────────────────────────────────
        today = date.today()
        memberships = [
            Membership(member_id=members[0].id, plan_id=plans[0].id, start_date=today - timedelta(days=10), end_date=today + timedelta(days=20), status="active", gym_id=gym.id),
            Membership(member_id=members[1].id, plan_id=plans[1].id, start_date=today - timedelta(days=30), end_date=today + timedelta(days=60), status="active", gym_id=gym.id),
            Membership(member_id=members[2].id, plan_id=plans[2].id, start_date=today - timedelta(days=100), end_date=today + timedelta(days=265), status="active", gym_id=gym.id),
            Membership(member_id=members[3].id, plan_id=plans[0].id, start_date=today - timedelta(days=25), end_date=today + timedelta(days=5), status="active", gym_id=gym.id),
            Membership(member_id=members[4].id, plan_id=plans[0].id, start_date=today - timedelta(days=35), end_date=today - timedelta(days=5), status="expired", gym_id=gym.id),
            Membership(member_id=members[5].id, plan_id=plans[1].id, start_date=today - timedelta(days=5), end_date=today + timedelta(days=85), status="active", auto_renew=True, gym_id=gym.id),
        ]
        s.add_all(memberships)
        s.commit()
        for ms in memberships:
            s.refresh(ms)

        # ── Payments ─────────────────────────────────────────────
        payments = [
            Payment(member_id=members[0].id, membership_id=memberships[0].id, amount=999, payment_method="upi", gym_id=gym.id),
            Payment(member_id=members[1].id, membership_id=memberships[1].id, amount=2499, payment_method="card", gym_id=gym.id),
            Payment(member_id=members[2].id, membership_id=memberships[2].id, amount=7999, payment_method="cash", gym_id=gym.id),
            Payment(member_id=members[3].id, membership_id=memberships[3].id, amount=999, payment_method="upi", gym_id=gym.id),
            Payment(member_id=members[5].id, membership_id=memberships[5].id, amount=2499, payment_method="online", gym_id=gym.id),
        ]
        s.add_all(payments)

        # ── Attendance ───────────────────────────────────────────
        now = datetime.now(timezone.utc)
        attendance_records = [
            Attendance(member_id=members[0].id, check_in=now - timedelta(hours=2), check_out=now - timedelta(hours=1), gym_id=gym.id),
            Attendance(member_id=members[1].id, check_in=now - timedelta(hours=1), gym_id=gym.id),
            Attendance(member_id=members[2].id, check_in=now - timedelta(minutes=30), gym_id=gym.id),
        ]
        s.add_all(attendance_records)

        # ── Trainers ─────────────────────────────────────────────
        trainers = [
            Trainer(full_name="Arjun Verma", email="arjun@gym.com", phone="9000000001", specialization="Weight Training", salary=25000, gym_id=gym.id),
            Trainer(full_name="Meera Iyer", email="meera@gym.com", phone="9000000002", specialization="Yoga", salary=22000, gym_id=gym.id),
            Trainer(full_name="Karan Malhotra", email="karan@gym.com", phone="9000000003", specialization="Cardio", salary=23000, gym_id=gym.id),
        ]
        s.add_all(trainers)

        # ── Notifications ────────────────────────────────────────
        notifications = [
            Notification(
                title="Welcome",
                message="System is up and running!",
                type="success",
                user_id=admin.id,
                gym_id=gym.id,
            ),
            Notification(
                title="Expiry Alert",
                message="Sneha Reddy membership expiring in 5 days",
                type="warning",
                user_id=admin.id,
                gym_id=gym.id,
            ),
        ]
        s.add_all(notifications)

        s.commit()
        print("Seed data inserted successfully!")
        print(f"  Gym: {gym.name} (id={gym.id})")
        print(f"  Admin: {admin.email} (gym_id={admin.gym_id})")
        print(f"  SaaS Plan: {free_plan.name} (limit={free_plan.member_limit})")
        print(f"  Members seeded: {len(members)}")


if __name__ == "__main__":
    seed()
