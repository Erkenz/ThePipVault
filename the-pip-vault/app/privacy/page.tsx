export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background text-pip-muted p-6 sm:p-12">
            <div className="max-w-3xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-pip-text mb-2">Privacy Policy</h1>
                    <p className="text-sm text-pip-muted">Last updated: January 2025</p>
                </div>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-pip-text">1. Introduction</h2>
                    <p>
                        Welcome to The PipVault ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data.
                        This privacy policy will inform you as to how we look after your personal data when you visit our website directly or use our application.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-pip-text">2. The Data We Collect</h2>
                    <p>
                        We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Identity Data:</strong> includes first name, last name.</li>
                        <li><strong>Contact Data:</strong> includes email address.</li>
                        <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version.</li>
                        <li><strong>Usage Data:</strong> includes information about how you use our website, specifically your trading journal entries.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-pip-text">3. How We Use Your Data</h2>
                    <p>
                        We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>To register you as a new customer.</li>
                        <li>To provide the trading journal service to you.</li>
                        <li>To manage our relationship with you.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-pip-text">4. Data Security</h2>
                    <p>
                        We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.
                        We use Supabase for authentication and database services, which provides industry-standard security.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-pip-text">5. Your Legal Rights (GDPR)</h2>
                    <p>
                        Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Request access to your personal data.</li>
                        <li>Request correction of your personal data.</li>
                        <li>Request erasure of your personal data ("Right to be forgotten").</li>
                        <li>Object to processing of your personal data.</li>
                    </ul>
                    <p className="mt-4">
                        You can exercise your right to delete your account and all associated data directly within the application settings or by contacting us.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-pip-text">6. Contact Us</h2>
                    <p>
                        If you have any questions about this privacy policy or our privacy practices, please contact us at support@thepipvault.com.
                    </p>
                </section>
            </div>
        </div>
    );
}
