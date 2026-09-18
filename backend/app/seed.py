"""
Γεμίζει τη βάση με ενδεικτικά δεδομένα για testing και για το παραδοτέο.

Τρέξιμο: docker compose exec backend python -m app.seed
Προϋπόθεση: η βάση να είναι άδεια (βλ. οδηγίες wipe πριν το τρέξιμο).
"""

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.academic import Course, Department, SuggestedBook
from app.models.listing import Listing, ListingCondition, ListingPhoto, ListingStatus, ListingType
from app.models.message import Message
from app.models.notification import Notification
from app.models.proposal import Proposal, ProposalStatus, ProposalType
from app.models.report import Report, ReportStatus
from app.models.review import Review
from app.models.user import User, UserRole
from app.models.wishlist import Wishlist

PASSWORD = "secret123"  # κοινό password για όλους τους dummy χρήστες, μόνο για testing


def seed() -> None:
    db = SessionLocal()

    try:
        # --- Χρήστες: 1 admin + 4 φοιτητές ---
        admin = User(
            institutional_email="admin@unipi.gr",
            hashed_password=hash_password(PASSWORD),
            full_name="Διαχειριστής Συστήματος",
            role=UserRole.admin,
        )
        maria = User(
            institutional_email="maria@unipi.gr",
            hashed_password=hash_password(PASSWORD),
            full_name="Μαρία Παπαδοπούλου",
        )
        giannis = User(
            institutional_email="giannis@unipi.gr",
            hashed_password=hash_password(PASSWORD),
            full_name="Γιάννης Κωνσταντίνου",
        )
        eleni = User(
            institutional_email="eleni@unipi.gr",
            hashed_password=hash_password(PASSWORD),
            full_name="Ελένη Δημητρίου",
        )
        kostas = User(
            institutional_email="kostas@unipi.gr",
            hashed_password=hash_password(PASSWORD),
            full_name="Κώστας Αντωνίου",
        )
        nikos = User(
            institutional_email="nikos@unipi.gr",
            hashed_password=hash_password(PASSWORD),
            full_name="Νίκος Γεωργίου",
            is_blocked=True,
        )
        db.add_all([admin, maria, giannis, eleni, kostas, nikos])
        db.commit()

        # --- Κατάλογος μαθημάτων και προτεινόμενα συγγράμματα ---
        department = Department(name="Τμήμα Πληροφορικής")
        db.add(department)
        db.commit()
        db.refresh(department)

        course_ai = Course(name="Τεχνητή Νοημοσύνη", department_id=department.id)
        course_algo = Course(name="Αλγόριθμοι και Πολυπλοκότητα", department_id=department.id)
        course_ds = Course(name="Δομές Δεδομένων", department_id=department.id)
        course_patrec = Course(name="Αναγνώριση Προτύπων", department_id=department.id)
        db.add_all([course_ai, course_algo, course_ds, course_patrec])
        db.commit()
        for course in [course_ai, course_algo, course_ds, course_patrec]:
            db.refresh(course)

        db.add_all(
            [
                SuggestedBook(
                    title="Τεχνητή Νοημοσύνη (Ι. Βλαχάβας, Π. Κεφαλάς κ.ά.)",
                    isbn="978-618-5196-44-8",
                    course_id=course_ai.id,
                ),
                SuggestedBook(
                    title="Εισαγωγή στους Αλγορίθμους (T. Cormen, C. Leiserson κ.ά.)",
                    isbn="978-960-524-473-6",
                    course_id=course_algo.id,
                ),
                SuggestedBook(
                    title="Δομές Δεδομένων, Αλγόριθμοι και Εφαρμογές στη C++ (S. Sahni)",
                    isbn="978-960-418-030-1",
                    course_id=course_ds.id,
                ),
                SuggestedBook(
                    title="Αναγνώριση Προτύπων (Σ. Θεοδωρίδης, Κ. Κουτρούμπας)",
                    isbn="978-960-489-145-0",
                    course_id=course_patrec.id,
                ),
            ]
        )
        db.commit()

        # --- Αγγελίες: μία για κάθε μάθημα ---
        ai_listing = Listing(
            owner_id=maria.id,
            title="Τεχνητή Νοημοσύνη - Ι. Βλαχάβας κ.ά.",
            isbn="978-618-5196-44-8",
            edition="4η Έκδοση (Εκδόσεις Πανεπιστημίου Μακεδονίας)",
            condition=ListingCondition.good,
            type=ListingType.exchange,
            course_id=course_ai.id,
            status=ListingStatus.active,
        )
        algo_listing = Listing(
            owner_id=giannis.id,
            title="Εισαγωγή στους Αλγορίθμους - Cormen et al.",
            isbn="978-960-524-473-6",
            edition="2η Έκδοση (Πανεπιστημιακές Εκδόσεις Κρήτης)",
            condition=ListingCondition.new,
            type=ListingType.sale,
            price=25.0,
            course_id=course_algo.id,
            status=ListingStatus.active,
        )
        ds_listing = Listing(
            owner_id=eleni.id,
            title="Δομές Δεδομένων, Αλγόριθμοι και Εφαρμογές στη C++ - S. Sahni",
            isbn="978-960-418-030-1",
            edition="1η Έκδοση (Εκδόσεις Τζιόλα)",
            condition=ListingCondition.worn,
            type=ListingType.donation,
            course_id=course_ds.id,
            status=ListingStatus.active,
        )
        patrec_listing = Listing(
            owner_id=kostas.id,
            title="Αναγνώριση Προτύπων - Σ. Θεοδωρίδης, Κ. Κουτρούμπας",
            isbn="978-960-489-145-0",
            edition="1η Έκδοση (Broken Hill / Πασχαλίδη)",
            condition=ListingCondition.good,
            type=ListingType.exchange,
            course_id=course_patrec.id,
            status=ListingStatus.active,
        )
        kostas_extra_listing = Listing(
            owner_id=kostas.id,
            title="Δομές Δεδομένων - συμπληρωματικό αντίτυπο",
            isbn="978-960-418-030-1",
            edition="2η Έκδοση",
            condition=ListingCondition.good,
            type=ListingType.exchange,
            course_id=course_ds.id,
            status=ListingStatus.active,
        )
        completed_sale_listing = Listing(
            owner_id=giannis.id,
            title="Βάσεις Δεδομένων - Elmasri",
            isbn="978-0000000010",
            edition="6η Έκδοση",
            condition=ListingCondition.good,
            type=ListingType.sale,
            price=18.0,
            course_id=course_algo.id,
            status=ListingStatus.completed,
        )
        completed_donation_listing = Listing(
            owner_id=eleni.id,
            title="Εισαγωγή στην Τεχνητή Νοημοσύνη",
            isbn="978-0000000011",
            edition="1η Έκδοση",
            condition=ListingCondition.worn,
            type=ListingType.donation,
            course_id=course_ai.id,
            status=ListingStatus.completed,
        )
        withdrawn_listing = Listing(
            owner_id=maria.id,
            title="Προγραμματισμός σε Python - αποσυρμένη αγγελία",
            isbn="978-0000000012",
            edition="3η Έκδοση",
            condition=ListingCondition.good,
            type=ListingType.sale,
            price=12.0,
            course_id=course_ds.id,
            status=ListingStatus.withdrawn,
        )
        db.add_all(
            [
                ai_listing,
                algo_listing,
                ds_listing,
                patrec_listing,
                kostas_extra_listing,
                completed_sale_listing,
                completed_donation_listing,
                withdrawn_listing,
            ]
        )
        db.commit()
        for listing in [
            ai_listing,
            algo_listing,
            ds_listing,
            patrec_listing,
            kostas_extra_listing,
            completed_sale_listing,
            completed_donation_listing,
            withdrawn_listing,
        ]:
            db.refresh(listing)

        db.add_all(
            [
                ListingPhoto(listing_id=ai_listing.id, url="/uploads/d2bc2d67f072417bb292778548d9d0ba.jpg"),
                ListingPhoto(listing_id=algo_listing.id, url="/uploads/aa99200b6b1e447b92a347a6dcc253bb.jpg"),
                ListingPhoto(listing_id=ds_listing.id, url="/uploads/9629487f834a41adb4ba9cf2864d1740.jpg"),
                ListingPhoto(listing_id=patrec_listing.id, url="/uploads/553a008d12b443baac3207f084cb6959.jpg"),
                ListingPhoto(listing_id=completed_sale_listing.id, url="/uploads/aa99200b6b1e447b92a347a6dcc253bb.jpg"),
            ]
        )
        db.commit()

        # --- Προτάσεις: μία για κάθε τύπο ---
        exchange_proposal = Proposal(
            listing_id=ai_listing.id,
            requester_id=kostas.id,
            type=ProposalType.exchange,
            status=ProposalStatus.accepted,
        )
        exchange_proposal.offered_books = [patrec_listing, kostas_extra_listing]
        sale_proposal = Proposal(
            listing_id=algo_listing.id,
            requester_id=maria.id,
            type=ProposalType.sale,
            status=ProposalStatus.pending,
        )
        donation_proposal = Proposal(
            listing_id=ds_listing.id,
            requester_id=giannis.id,
            type=ProposalType.donation,
            status=ProposalStatus.rejected,
        )
        accepted_sale_proposal = Proposal(
            listing_id=completed_sale_listing.id,
            requester_id=maria.id,
            type=ProposalType.sale,
            status=ProposalStatus.accepted,
        )
        accepted_donation_proposal = Proposal(
            listing_id=completed_donation_listing.id,
            requester_id=giannis.id,
            type=ProposalType.donation,
            status=ProposalStatus.accepted,
        )
        db.add_all(
            [
                exchange_proposal,
                sale_proposal,
                donation_proposal,
                accepted_sale_proposal,
                accepted_donation_proposal,
            ]
        )
        db.commit()
        db.refresh(exchange_proposal)
        db.refresh(accepted_sale_proposal)
        db.refresh(accepted_donation_proposal)

        # --- Μηνύματα στις αποδεκτές προτάσεις ---
        db.add_all(
            [
                Message(
                    proposal_id=exchange_proposal.id,
                    sender_id=kostas.id,
                    content="Γεια σου Μαρία! Ενδιαφέρομαι για την Τεχνητή Νοημοσύνη και σου προσφέρω την Αναγνώριση Προτύπων.",
                ),
                Message(
                    proposal_id=exchange_proposal.id,
                    sender_id=maria.id,
                    content="Τέλεια! Μπορούμε να βρεθούμε αύριο στη γραμματεία μετά το μάθημα;",
                ),
                Message(
                    proposal_id=accepted_sale_proposal.id,
                    sender_id=maria.id,
                    content="Καλησπέρα! Θα ήθελα να αγοράσω το βιβλίο. Μπορούμε να συναντηθούμε στη σχολή;",
                ),
                Message(
                    proposal_id=accepted_sale_proposal.id,
                    sender_id=giannis.id,
                    content="Βεβαίως, θα το έχω μαζί μου αύριο μετά το μάθημα.",
                ),
                Message(
                    proposal_id=accepted_donation_proposal.id,
                    sender_id=giannis.id,
                    content="Ευχαριστώ πολύ για τη δωρεά του βιβλίου!",
                ),
            ]
        )
        db.commit()

        # --- Αξιολογήσεις ολοκληρωμένης συναλλαγής ---
        db.add_all(
            [
                Review(
                    proposal_id=exchange_proposal.id,
                    reviewer_id=maria.id,
                    reviewee_id=kostas.id,
                    rating=5,
                    comment="Πολύ καλή κατάσταση το βιβλίο της Αναγνώρισης Προτύπων και άμεση συνεννόηση!",
                ),
                Review(
                    proposal_id=exchange_proposal.id,
                    reviewer_id=kostas.id,
                    reviewee_id=maria.id,
                    rating=5,
                    comment="Ευχαριστώ πολύ! Άψογη συνεργασία και το βιβλίο ΤΝ ήταν σαν καινούργιο.",
                ),
                Review(
                    proposal_id=accepted_sale_proposal.id,
                    reviewer_id=maria.id,
                    reviewee_id=giannis.id,
                    rating=4,
                    comment="Γρήγορη συνεννόηση και το βιβλίο ήταν σε πολύ καλή κατάσταση.",
                ),
                Review(
                    proposal_id=accepted_donation_proposal.id,
                    reviewer_id=giannis.id,
                    reviewee_id=eleni.id,
                    rating=5,
                    comment="Ευχαριστώ για τη δωρεά και την άμεση παράδοση.",
                ),
            ]
        )
        db.commit()

        # --- Λίστα επιθυμιών ---
        db.add_all(
            [
                Wishlist(user_id=eleni.id, course_id=course_algo.id),
                Wishlist(user_id=giannis.id, isbn="978-618-5196-44-8"),
                Wishlist(user_id=maria.id, title="Αλγορίθμους"),
            ]
        )
        db.commit()

        # --- Ειδοποιήσεις: unread και read καταστάσεις ---
        db.add_all(
            [
                Notification(
                    user_id=eleni.id,
                    listing_id=algo_listing.id,
                    content="Νέα αγγελία ταιριάζει με τη λίστα επιθυμιών σου: 'Εισαγωγή στους Αλγορίθμους - Cormen et al.'",
                    is_read=False,
                ),
                Notification(
                    user_id=giannis.id,
                    listing_id=ai_listing.id,
                    content="Νέα αγγελία ταιριάζει με τη λίστα επιθυμιών σου: 'Τεχνητή Νοημοσύνη - Ι. Βλαχάβας κ.ά.'",
                    is_read=True,
                ),
                Notification(
                    user_id=maria.id,
                    listing_id=algo_listing.id,
                    content="Νέα αγγελία ταιριάζει με τη λίστα επιθυμιών σου: 'Εισαγωγή στους Αλγορίθμους - Cormen et al.'",
                    is_read=False,
                ),
            ]
        )
        db.commit()

        # --- Αναφορές κατάχρησης: open και resolved καταστάσεις ---
        db.add_all(
            [
                Report(
                    reporter_id=maria.id,
                    reported_user_id=giannis.id,
                    reason="Δεν εμφανίστηκε στο ραντεβού παράδοσης.",
                    status=ReportStatus.open,
                ),
                Report(
                    reporter_id=eleni.id,
                    reported_user_id=kostas.id,
                    reason="Η περιγραφή της αγγελίας δεν αντιστοιχούσε στο βιβλίο.",
                    status=ReportStatus.resolved,
                ),
            ]
        )
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

    print("Seed ολοκληρώθηκε: 6 χρήστες, 4 μαθήματα, 8 listings, 5 proposals, messages, reviews, wishlist, notifications και reports.")


if __name__ == "__main__":
    seed()
