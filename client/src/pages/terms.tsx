import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-600">
            Last updated: July 30, 2025
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing or using the Fundr platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Platform Description</h2>
            <p className="text-gray-700 mb-4">
              Fundr is a decentralized, non-custodial platform on Solana that enables users to create and invest in on-chain funds. The platform facilitates fund management through smart contracts and does not hold custody of user funds.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Risk Disclosure</h2>
            <p className="text-gray-700 mb-4">
              <strong>WARNING:</strong> Investing in cryptocurrency funds involves substantial risk of loss and is not suitable for all investors. The value of investments can go down as well as up, and you may lose all of your invested capital.
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4">
              <li>Fund managers are independent third parties not employed by Fundr</li>
              <li>Past performance does not guarantee future results</li>
              <li>All investments are made at your own risk</li>
              <li>Funds may use leverage and derivatives which increase risk</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Responsibilities</h2>
            <p className="text-gray-700 mb-4">
              Users are responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4">
              <li>Conducting their own due diligence before investing</li>
              <li>Understanding the risks associated with each fund</li>
              <li>Maintaining the security of their wallet and private keys</li>
              <li>Complying with applicable laws and regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Fees and Charges</h2>
            <p className="text-gray-700 mb-4">
              Fundr charges platform fees as follows:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4">
              <li>1% fee on deposits (used for $FUND token buy/burn)</li>
              <li>1% fee on withdrawals (platform treasury)</li>
              <li>Fund managers may charge performance fees up to 20%</li>
              <li>Platform index funds have 0% management fees</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              Fundr operates as a technology platform only. We do not provide investment advice and are not responsible for fund performance, manager actions, or investment outcomes. Users acknowledge that all investments are made at their own risk.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              For questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-gray-700">
              Email: legal@fundr.app<br />
              Discord: <a href="https://discord.gg/fundr" className="text-pump hover:underline">discord.gg/fundr</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}