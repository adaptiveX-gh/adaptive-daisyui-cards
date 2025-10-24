/**
 * ContentGenerator Service
 * Phase 1: Deterministic content mapping for MVP topics
 * Phase 4: Will be replaced with LLM-based generation
 */

const CONTENT_DATABASE = {
  'AI in Product Discovery': {
    title: {
      layout: 'hero-overlay',
      content: {
        title: 'AI in Product Discovery',
        subtitle: 'Transforming Ideas into Innovation',
        kicker: 'A Modern Approach',
        imagePrompt: 'abstract futuristic AI technology background, professional presentation style'
      }
    },
    objectives: {
      layout: 'numbered-list',
      content: {
        intro: 'By the end of this session, you\'ll be able to:',
        items: [
          'Identify customer problems using AI on qualitative data',
          'Generate diverse product ideas with AI assistance',
          'Refine and select top ideas using AI scoring',
          'Validate assumptions with AI-powered user research',
          'Build a data-driven product roadmap'
        ]
      }
    },
    process: {
      layout: 'grid',
      content: {
        title: 'The AI-Powered Discovery Process',
        cells: [
          {
            title: '1. Problem Identification',
            body: 'Use AI to analyze customer feedback, support tickets, and user interviews to uncover pain points'
          },
          {
            title: '2. Idea Generation',
            body: 'Leverage AI to brainstorm solutions, explore adjacent opportunities, and identify market gaps'
          },
          {
            title: '3. Concept Validation',
            body: 'Score and prioritize ideas using AI-driven impact analysis and feasibility assessment'
          },
          {
            title: '4. Implementation',
            body: 'Build MVPs with AI-assisted prototyping and continuous user feedback loops'
          }
        ]
      }
    },
    benefits: {
      layout: 'content-bullets',
      content: {
        title: 'Why AI-Powered Discovery?',
        bullets: [
          'Process 100x more customer data than manual analysis',
          'Reduce time-to-insight from weeks to hours',
          'Uncover hidden patterns in user behavior',
          'Generate more diverse solution alternatives',
          'Make data-driven prioritization decisions',
          'Scale discovery across multiple products'
        ],
        footnote: 'Based on industry research and case studies from leading product teams'
      }
    },
    methodology: {
      layout: 'split',
      content: {
        title: 'AI-Assisted Research Methodology',
        body: [
          'Start with qualitative data collection from multiple sources',
          'Use NLP to extract themes and sentiment from text',
          'Apply machine learning for pattern recognition',
          'Generate hypotheses using AI ideation tools',
          'Validate findings with quantitative analysis'
        ],
        imagePrompt: 'data visualization and analytics dashboard, modern UI design'
      }
    },
    conclusion: {
      layout: 'hero',
      content: {
        title: 'Ready to Transform Your Product Discovery?',
        subtitle: 'Start leveraging AI today',
        cta: {
          label: 'Get Started',
          href: '#'
        },
        imagePrompt: 'success and innovation concept, upward growth arrows'
      }
    }
  },

  'Digital Marketing Trends 2025': {
    title: {
      layout: 'hero-overlay',
      content: {
        title: 'Digital Marketing Trends 2025',
        subtitle: 'What Every Marketer Needs to Know',
        kicker: 'Stay Ahead of the Curve',
        imagePrompt: 'digital marketing and technology, modern abstract background'
      }
    },
    objectives: {
      layout: 'numbered-list',
      content: {
        intro: 'Key trends shaping digital marketing:',
        items: [
          'AI-powered personalization at scale',
          'Privacy-first marketing strategies',
          'Interactive and immersive content',
          'Voice and visual search optimization',
          'Sustainable and ethical marketing'
        ]
      }
    },
    trends: {
      layout: 'grid',
      content: {
        title: 'Top Marketing Technologies',
        cells: [
          {
            title: 'AI & Automation',
            body: 'Machine learning for predictive analytics, chatbots, and automated campaign optimization'
          },
          {
            title: 'AR/VR Experiences',
            body: 'Immersive product demonstrations and virtual showrooms for enhanced engagement'
          },
          {
            title: 'Web3 & Blockchain',
            body: 'NFT marketing, cryptocurrency payments, and decentralized brand communities'
          },
          {
            title: 'Zero-Party Data',
            body: 'Direct customer data collection through interactive experiences and preference centers'
          }
        ]
      }
    },
    strategies: {
      layout: 'content-bullets',
      content: {
        title: 'Winning Strategies for 2025',
        bullets: [
          'Focus on first-party data collection and customer consent',
          'Invest in video content across all platforms',
          'Build community-driven marketing campaigns',
          'Optimize for conversational and voice search',
          'Embrace sustainability in brand messaging',
          'Create personalized omnichannel experiences'
        ],
        footnote: 'Insights from leading marketing research firms'
      }
    },
    channels: {
      layout: 'split',
      content: {
        title: 'Evolving Channel Mix',
        body: [
          'Social commerce continues to grow exponentially',
          'Short-form video dominates attention economy',
          'Podcast advertising reaches mainstream adoption',
          'Email marketing remains highest ROI channel',
          'Connected TV advertising becomes accessible to SMBs'
        ],
        imagePrompt: 'social media and digital channels icons, colorful modern design'
      }
    },
    action: {
      layout: 'hero',
      content: {
        title: 'Adapt or Fall Behind',
        subtitle: 'Update your marketing strategy today',
        cta: {
          label: 'Download Guide',
          href: '#'
        },
        imagePrompt: 'forward progress and innovation concept'
      }
    }
  },

  'Remote Team Management': {
    title: {
      layout: 'hero-overlay',
      content: {
        title: 'Remote Team Management',
        subtitle: 'Building High-Performance Distributed Teams',
        kicker: 'The Future of Work',
        imagePrompt: 'remote work and collaboration, diverse team members on video calls'
      }
    },
    objectives: {
      layout: 'numbered-list',
      content: {
        intro: 'Essential skills for remote team leaders:',
        items: [
          'Establish clear communication protocols',
          'Build trust in distributed environments',
          'Maintain team culture across time zones',
          'Measure performance based on outcomes',
          'Foster collaboration without proximity'
        ]
      }
    },
    challenges: {
      layout: 'grid',
      content: {
        title: 'Common Remote Challenges',
        cells: [
          {
            title: 'Communication Gaps',
            body: 'Reduced informal interactions and potential for misunderstandings in async communication'
          },
          {
            title: 'Timezone Coordination',
            body: 'Scheduling meetings and managing real-time collaboration across global teams'
          },
          {
            title: 'Isolation & Burnout',
            body: 'Remote workers feeling disconnected, difficulty separating work from personal life'
          },
          {
            title: 'Technology Barriers',
            body: 'Tool fatigue, security concerns, and inconsistent home office setups'
          }
        ]
      }
    },
    solutions: {
      layout: 'content-bullets',
      content: {
        title: 'Best Practices for Success',
        bullets: [
          'Over-communicate expectations and provide regular feedback',
          'Invest in the right collaboration tools and training',
          'Schedule regular 1-on-1s and team bonding activities',
          'Document everything for async knowledge sharing',
          'Respect boundaries and encourage work-life balance',
          'Celebrate wins and maintain visibility of achievements'
        ],
        footnote: 'Based on research from remote-first companies'
      }
    },
    tools: {
      layout: 'split',
      content: {
        title: 'Remote Team Tech Stack',
        body: [
          'Video conferencing: Zoom, Google Meet, or Microsoft Teams',
          'Async communication: Slack, Discord, or Microsoft Teams',
          'Project management: Asana, Trello, Jira, or Linear',
          'Documentation: Notion, Confluence, or Google Workspace',
          'Time tracking: Toggl, Harvest, or Clockify'
        ],
        imagePrompt: 'technology tools and software interface, modern digital workspace'
      }
    },
    future: {
      layout: 'hero',
      content: {
        title: 'Master Remote Leadership',
        subtitle: 'Build resilient distributed teams',
        cta: {
          label: 'Learn More',
          href: '#'
        },
        imagePrompt: 'team success and collaboration concept'
      }
    }
  }
};

export class ContentGenerator {
  constructor() {
    this.database = CONTENT_DATABASE;
  }

  /**
   * Generate content for a single card
   * Phase 1: Deterministic mapping from content database
   */
  generateCardContent({ topic, layoutType, tone, contentSections, style }) {
    // Validate topic exists
    if (!this.database[topic]) {
      throw new Error(`Unknown topic: ${topic}. Available topics: ${Object.keys(this.database).join(', ')}`);
    }

    const topicData = this.database[topic];

    // If specific content section is requested, try to find it
    if (contentSections && contentSections.length > 0) {
      const sectionKey = contentSections[0].toLowerCase();
      const section = topicData[sectionKey];

      if (section) {
        return {
          type: sectionKey,
          layout: section.layout,
          content: section.content
        };
      }
    }

    // Find content matching the requested layout
    for (const [key, section] of Object.entries(topicData)) {
      if (section.layout === layoutType) {
        return {
          type: key,
          layout: section.layout,
          content: section.content
        };
      }
    }

    // Fallback: return first section that matches layout or first section overall
    const firstMatchingSection = Object.entries(topicData).find(([_, section]) =>
      section.layout === layoutType
    );

    if (firstMatchingSection) {
      const [key, section] = firstMatchingSection;
      return {
        type: key,
        layout: section.layout,
        content: section.content
      };
    }

    // Ultimate fallback
    const firstSection = Object.entries(topicData)[0];
    return {
      type: firstSection[0],
      layout: firstSection[1].layout,
      content: firstSection[1].content
    };
  }

  /**
   * Generate a complete presentation for a topic
   */
  generatePresentation({ topic, cardCount = 6, style = 'professional', includeImages = false, layouts = null }) {
    if (!this.database[topic]) {
      throw new Error(`Unknown topic: ${topic}. Available topics: ${Object.keys(this.database).join(', ')}`);
    }

    const topicData = this.database[topic];
    const cards = [];

    // Get all sections for the topic
    const sections = Object.entries(topicData);

    // Limit to requested card count
    const selectedSections = sections.slice(0, cardCount);

    // Generate cards from sections
    for (const [key, section] of selectedSections) {
      const cardData = {
        type: key,
        layout: section.layout,
        content: section.content
      };

      // Add image placeholder if images are requested
      if (includeImages && section.content.imagePrompt) {
        cardData.image = {
          status: 'generating',
          provider: 'placeholder'
        };
        cardData.placeholders = {
          type: 'geometric',
          color: 'based-on-theme',
          loadingState: true,
          aspectRatio: section.layout.includes('hero') ? '16:9' : '4:3'
        };
      }

      cards.push(cardData);
    }

    return {
      cards,
      topic,
      cardCount: cards.length
    };
  }

  /**
   * Get list of available topics
   */
  getAvailableTopics() {
    return Object.keys(this.database);
  }

  /**
   * Get all sections for a topic
   */
  getTopicSections(topic) {
    if (!this.database[topic]) {
      throw new Error(`Unknown topic: ${topic}`);
    }

    return Object.keys(this.database[topic]);
  }
}

export default ContentGenerator;
