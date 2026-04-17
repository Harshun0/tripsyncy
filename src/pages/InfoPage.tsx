import React from 'react';
import { ArrowLeft, Bot, Briefcase, FileText, HeartHandshake, Mail, MapPin, Phone, ShieldCheck, Sparkles, Users, Wand2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '@/components/layout/Footer';

type InfoPageVariant = 'features' | 'ai-itinerary' | 'about' | 'careers' | 'blog' | 'press' | 'help-center' | 'privacy-policy' | 'terms-of-service';

interface InfoPageProps {
  page: InfoPageVariant;
}

const featureCards = [
  {
    title: 'Travel feed that feels alive',
    body: 'Post trips, browse destinations, save inspiration, and jump straight from a travel story into a real conversation.',
    icon: Sparkles,
  },
  {
    title: 'Connection-based messaging',
    body: 'Chat opens only after a request is accepted, with read receipts, media sharing, emojis, and private message history.',
    icon: Users,
  },
  {
    title: 'AI itinerary planning',
    body: 'Turn a destination idea into a trip plan with smart day-by-day structure, budgeting hints, and travel-ready suggestions.',
    icon: Wand2,
  },
  {
    title: 'Safer travel networking',
    body: 'Profiles, follow controls, privacy settings, moderation tools, and cleaner trust signals help users connect with confidence.',
    icon: ShieldCheck,
  },
];

const legalSections = {
  privacy: [
    {
      title: 'Information we collect',
      text: 'TripSync may collect profile details, travel preferences, posts, messages metadata, device information, and support communication details to operate the platform experience.',
    },
    {
      title: 'How we use information',
      text: 'We use information to provide travel discovery, social features, messaging, personalization, safety review workflows, and service improvements across the app.',
    },
    {
      title: 'Data sharing and protection',
      text: 'We limit access to operational needs, use platform security controls, and only disclose information where required for service delivery, abuse prevention, or legal compliance.',
    },
    {
      title: 'Your choices',
      text: 'Users can update profile details, control visibility settings, manage connections, and contact support for privacy-related requests or account assistance.',
    },
  ],
  terms: [
    {
      title: 'Use of service',
      text: 'By using TripSync, you agree to use the platform lawfully, provide accurate account information, and avoid abusive, deceptive, or harmful behavior toward other users.',
    },
    {
      title: 'User content',
      text: 'You remain responsible for the content you upload or send, including media, travel posts, profile information, and messages shared through the platform.',
    },
    {
      title: 'Safety and moderation',
      text: 'TripSync may review reports, restrict abusive accounts, remove violating content, and take reasonable action to protect platform integrity and user safety.',
    },
    {
      title: 'Service availability',
      text: 'We may update, improve, or pause parts of the service from time to time, and we do not guarantee uninterrupted access in every situation or region.',
    },
  ],
};

const PageShell: React.FC<{ eyebrow: string; title: string; description: string; children: React.ReactNode }> = ({ eyebrow, title, description, children }) => (
  <div className="min-h-screen bg-background">
    <div className="relative overflow-hidden border-b border-border bg-card">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.16),transparent_35%),radial-gradient(circle_at_bottom_right,hsl(var(--secondary)/0.12),transparent_30%)]" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to TripSync
        </Link>
        <div className="max-w-3xl pt-10 pb-6 sm:pt-16 sm:pb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary mb-4">{eyebrow}</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">{title}</h1>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl">{description}</p>
        </div>
      </div>
    </div>
    <main>{children}</main>
    <Footer />
  </div>
);

const EmptyStatePage: React.FC<{ eyebrow: string; title: string; description: string; icon: React.ElementType; note: string }> = ({ eyebrow, title, description, icon: Icon, note }) => (
  <PageShell eyebrow={eyebrow} title={title} description={description}>
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <div className="travel-card p-10 sm:p-14 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
          <Icon className="w-8 h-8 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">{note}</h2>
        <p className="mt-3 text-muted-foreground">We’ll update this section as soon as new information is available.</p>
      </div>
    </section>
  </PageShell>
);

const InfoPage: React.FC<InfoPageProps> = ({ page }) => {
  if (page === 'features') {
    return (
      <PageShell eyebrow="Platform Features" title="Everything TripSync does in one place" description="TripSync blends travel discovery, trusted connections, AI planning, and real messaging into a single social travel experience.">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-8">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
            <div className="travel-card p-8 sm:p-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.15),transparent_40%),linear-gradient(135deg,hsl(var(--card)),hsl(var(--muted)/0.7))]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary mb-4">Core experience</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">From discovering travelers to planning the trip and chatting after approval.</h2>
              <p className="mt-4 text-muted-foreground max-w-2xl">The product is designed around real discovery, intentional connections, and travel-first communication instead of generic social noise.</p>
            </div>
            <div className="travel-card p-8 flex flex-col justify-between bg-card">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                <HeartHandshake className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">Built for travelers, not just profiles.</h3>
                <p className="mt-3 text-muted-foreground">Posts, location context, travel interests, follows, and direct messaging all support one clear goal: helping people travel together with clarity.</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {featureCards.map(({ title, body, icon: Icon }) => (
              <article key={title} className="travel-card p-7 sm:p-8">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{title}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">{body}</p>
              </article>
            ))}
          </div>
        </section>
      </PageShell>
    );
  }

  if (page === 'ai-itinerary') {
    return (
      <PageShell eyebrow="AI Itinerary" title="Plan smarter trips in minutes" description="Describe a destination, trip length, and budget, then let TripSync turn it into a structured plan ready for exploration.">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 grid lg:grid-cols-2 gap-8 items-start">
          <div className="travel-card p-8 sm:p-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.16),transparent_36%),linear-gradient(135deg,hsl(var(--card)),hsl(var(--muted)/0.78))]">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-glow">
              <Bot className="w-7 h-7 text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-bold text-foreground">AI-assisted routing, pacing, and ideas.</h2>
            <p className="mt-4 text-muted-foreground">TripSync’s itinerary builder helps users move from a vague destination idea to a clearer day-by-day flow with better travel momentum.</p>
          </div>
          <div className="space-y-4">
            {[
              'Generate travel plans from destination, budget, and duration.',
              'Organize activities into day-wise structure that feels easier to follow.',
              'Reduce planning friction for solo travel, group travel, and quick getaways.',
              'Stay inside the same travel platform instead of jumping between tools.',
            ].map((item) => (
              <div key={item} className="travel-card p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <p className="text-foreground leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </section>
      </PageShell>
    );
  }

  if (page === 'about') {
    return (
      <PageShell eyebrow="About TripSync" title="A travel network built around better connections" description="TripSync is designed to make discovering people, places, and plans feel smoother, safer, and more intentional for modern travelers.">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-8">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="travel-card p-8 lg:col-span-2">
              <h2 className="text-3xl font-bold text-foreground">Why TripSync exists</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">Travelers often jump between feeds, chat apps, planning tools, and scattered group coordination. TripSync brings those layers together so inspiration, trust, and planning live in one experience.</p>
            </div>
            <div className="travel-card p-8 bg-card">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Travel-first design</h3>
              <p className="mt-3 text-muted-foreground">Every major interaction is built around destinations, people, and trust-based messaging.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              ['Discover', 'Explore real traveler profiles, travel stories, and destination-led inspiration.'],
              ['Connect', 'Follow, accept, and start conversations only when the connection is approved.'],
              ['Plan', 'Use AI itinerary support to turn ideas into more actionable trips.'],
            ].map(([title, copy]) => (
              <div key={title} className="travel-card p-7">
                <h3 className="text-xl font-bold text-foreground">{title}</h3>
                <p className="mt-3 text-muted-foreground">{copy}</p>
              </div>
            ))}
          </div>
        </section>
      </PageShell>
    );
  }

  if (page === 'careers') {
    return <EmptyStatePage eyebrow="Careers" title="Build the future of social travel" description="Open roles, hiring updates, and future opportunities will be listed here." icon={Briefcase} note="No jobs found" />;
  }

  if (page === 'blog') {
    return <EmptyStatePage eyebrow="Blog" title="Stories, product notes, and travel thinking" description="TripSync blog posts will appear here once publishing begins." icon={FileText} note="No blogs" />;
  }

  if (page === 'press') {
    return <EmptyStatePage eyebrow="Press" title="Media resources and announcements" description="Press statements and media mentions will appear here when available." icon={Sparkles} note="No press" />;
  }

  if (page === 'help-center') {
    return (
      <PageShell eyebrow="Help & Contact" title="Get help from the TripSync team" description="For help with your account, messages, profile, or travel planning issues, use the contact details below.">
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 grid md:grid-cols-2 gap-6">
          <div className="travel-card p-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Email support</h2>
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=dipanshukaranjekar2003@gmail.com" target="_blank" rel="noreferrer" className="mt-4 inline-flex text-primary font-semibold hover:underline">hello@tripsync.com</a>
            <p className="mt-3 text-muted-foreground">For account help, follow issues, profile corrections, or general assistance.</p>
          </div>
          <div className="travel-card p-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
              <Phone className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Phone</h2>
            <a href="tel:+918103146100" className="mt-4 inline-flex text-primary font-semibold hover:underline">+91 8103146100</a>
            <p className="mt-3 text-muted-foreground">For direct support and urgent help related to the platform experience.</p>
          </div>
        </section>
      </PageShell>
    );
  }

  if (page === 'privacy-policy') {
    return (
      <PageShell eyebrow="Privacy Policy" title="How TripSync handles your information" description="This overview explains the kind of information TripSync may process and the principles used to protect it.">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-5">
          {legalSections.privacy.map((section) => (
            <article key={section.title} className="travel-card p-7 sm:p-8">
              <h2 className="text-2xl font-bold text-foreground">{section.title}</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">{section.text}</p>
            </article>
          ))}
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell eyebrow="Terms of Service" title="The rules for using TripSync" description="These terms outline user responsibilities, content expectations, and key service conditions for the TripSync platform.">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-5">
        {legalSections.terms.map((section) => (
          <article key={section.title} className="travel-card p-7 sm:p-8">
            <h2 className="text-2xl font-bold text-foreground">{section.title}</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">{section.text}</p>
          </article>
        ))}
      </section>
    </PageShell>
  );
};

export default InfoPage;