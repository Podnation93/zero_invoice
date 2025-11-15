import React, { useState, useEffect } from 'react';
import { Sparkles, Lightbulb, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import type { LayoutBlock } from '../../types/template';
import { geminiService } from '../../services/geminiService';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

interface LayoutSuggestionsProps {
  currentLayout: LayoutBlock[];
  onApply: (layout: LayoutBlock[]) => void;
  onClose: () => void;
}

interface Suggestion {
  title: string;
  description: string;
  reasoning: string;
}

export const LayoutSuggestions: React.FC<LayoutSuggestionsProps> = ({
  currentLayout,
  onApply: _onApply,
  onClose,
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [_rawSuggestions, setRawSuggestions] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);

  const isConfigured = geminiService.isConfigured();

  useEffect(() => {
    if (!isConfigured) {
      setError(
        'AI service is not configured. Please set up your Gemini API key in environment variables.'
      );
    } else if (currentLayout.length === 0) {
      setError('Please add some blocks to your template before requesting suggestions.');
    } else {
      // Auto-generate on mount
      handleGenerateSuggestions();
    }
  }, []);

  const handleGenerateSuggestions = async () => {
    if (currentLayout.length === 0) {
      setError('Please add some blocks to your template before requesting suggestions.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuggestions([]);

    try {
      // Call the AI service
      await geminiService.suggestTemplateLayout(currentLayout);

      // The service currently logs suggestions but doesn't return parsed data
      // We'll create a mock implementation that provides helpful suggestions
      // In a production environment, you'd parse the AI response into structured data

      const prompt = `Analyze this invoice template layout and suggest 3 specific improvements.

Current Layout:
${currentLayout
  .map(
    (block) =>
      `- ${block.type}: position(${block.position.x}, ${block.position.y}), size(${block.size.width}x${block.size.height})`
  )
  .join('\n')}

Available block types: logo, header, customer, items, totals, notes, footer
Page size: 210mm x 297mm (A4) = 794x1123 pixels

Please suggest 3 specific improvements focusing on:
1. Visual hierarchy and readability
2. Professional appearance
3. Optimal use of space
4. Better positioning of critical elements (totals, due date, etc.)

For each suggestion, provide:
- A clear title (one line)
- What to change (2-3 sentences)
- Why it improves the design (1-2 sentences)

Format as:
SUGGESTION 1: [Title]
DESCRIPTION: [What to change]
REASONING: [Why it improves]

SUGGESTION 2: [Title]
...`;

      // Make the actual API call
      const aiResponse = await geminiService['makeRequest'](prompt);
      setRawSuggestions(aiResponse);

      // Parse the AI response into structured suggestions
      const parsedSuggestions = parseAISuggestions(aiResponse);
      setSuggestions(parsedSuggestions);
      setHasGenerated(true);
    } catch (err) {
      console.error('Error generating layout suggestions:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate layout suggestions');

      // Provide fallback suggestions based on common layout patterns
      setSuggestions(getFallbackSuggestions(currentLayout));
      setHasGenerated(true);
    } finally {
      setIsLoading(false);
    }
  };

  const parseAISuggestions = (response: string): Suggestion[] => {
    const suggestions: Suggestion[] = [];

    // Try to parse the AI response into structured suggestions
    const suggestionMatches = response.split(/SUGGESTION \d+:/i);

    for (let i = 1; i < suggestionMatches.length && i <= 3; i++) {
      const section = suggestionMatches[i];
      const titleMatch = section.match(/^([^\n]+)/);
      const descMatch = section.match(/DESCRIPTION:\s*([^]*?)(?=REASONING:|$)/i);
      const reasonMatch = section.match(/REASONING:\s*([^]*?)(?=SUGGESTION|$)/i);

      if (titleMatch) {
        suggestions.push({
          title: titleMatch[1].trim(),
          description: descMatch ? descMatch[1].trim() : 'Improve layout structure',
          reasoning: reasonMatch ? reasonMatch[1].trim() : 'Enhances visual appeal and readability',
        });
      }
    }

    // If parsing failed, create generic suggestions from the raw text
    if (suggestions.length === 0) {
      const lines = response.split('\n').filter((line) => line.trim());
      let currentSuggestion: Partial<Suggestion> = {};

      for (const line of lines) {
        if (line.match(/^\d+\.|^-|^\*/)) {
          if (currentSuggestion.title) {
            suggestions.push(currentSuggestion as Suggestion);
          }
          currentSuggestion = {
            title: line.replace(/^\d+\.|^-|^\*/, '').trim(),
            description: '',
            reasoning: '',
          };
        } else if (currentSuggestion.title && line.trim()) {
          if (!currentSuggestion.description) {
            currentSuggestion.description = line.trim();
          } else {
            currentSuggestion.reasoning = line.trim();
          }
        }
      }

      if (currentSuggestion.title) {
        suggestions.push(currentSuggestion as Suggestion);
      }
    }

    return suggestions.slice(0, 3);
  };

  const getFallbackSuggestions = (layout: LayoutBlock[]): Suggestion[] => {
    const suggestions: Suggestion[] = [];
    const hasLogo = layout.some((b) => b.type === 'logo');
    const hasHeader = layout.some((b) => b.type === 'header');
    const hasCustomer = layout.some((b) => b.type === 'customer');
    const hasItems = layout.some((b) => b.type === 'items');
    const hasTotals = layout.some((b) => b.type === 'totals');

    if (!hasLogo || !hasHeader) {
      suggestions.push({
        title: 'Add Branding Elements',
        description:
          'Include a logo at the top-left and a prominent header section. Position the logo around (20, 20) with size 150x100, and the header at (200, 20) with size 550x120.',
        reasoning:
          'Strong branding creates professional credibility and makes invoices instantly recognizable to clients.',
      });
    }

    if (hasTotals) {
      const totalsBlock = layout.find((b) => b.type === 'totals');
      if (totalsBlock && totalsBlock.position.x < 400) {
        suggestions.push({
          title: 'Align Totals to Right',
          description:
            'Move the totals block to the right side of the page (around x: 450) to improve visual scanning. The eye naturally looks to the right for totals and prices.',
          reasoning:
            'Right-aligned totals follow accounting conventions and make it easier for clients to quickly find payment amounts.',
        });
      }
    }

    if (hasCustomer && hasItems) {
      suggestions.push({
        title: 'Optimize Vertical Spacing',
        description:
          'Ensure adequate vertical spacing between blocks (minimum 20px). Place customer info around y: 160, items table around y: 330, and totals at y: 700.',
        reasoning:
          'Proper spacing prevents visual clutter and makes the invoice easier to read and scan quickly.',
      });
    }

    if (hasItems && !hasTotals) {
      suggestions.push({
        title: 'Add Totals Section',
        description:
          'Include a totals block below the line items to show subtotal, tax, and total clearly. Position it at (450, 700) with size 300x150.',
        reasoning:
          'Clear financial summaries are essential for invoices and help prevent payment disputes.',
      });
    }

    // If we still don't have 3 suggestions, add general ones
    while (suggestions.length < 3) {
      if (suggestions.length === 0) {
        suggestions.push({
          title: 'Follow Visual Hierarchy',
          description:
            'Arrange blocks in order of importance: logo/header at top, customer info and items in middle, totals and notes at bottom. Use the full page width (750px) for tables.',
          reasoning:
            'Proper hierarchy guides the reader through the invoice naturally, improving comprehension and trust.',
        });
      } else if (suggestions.length === 1) {
        suggestions.push({
          title: 'Maximize Content Width',
          description:
            'Use wider blocks for tables and text-heavy sections. Line items should be at least 700px wide to accommodate all columns comfortably.',
          reasoning:
            'Full-width content utilizes space efficiently and reduces the need for text wrapping.',
        });
      } else {
        suggestions.push({
          title: 'Balance Block Sizes',
          description:
            'Ensure blocks are proportionally sized based on content importance. Headers: 120px tall, items: 300px+, customer info: 150px, totals: 150px.',
          reasoning:
            'Balanced proportions create visual harmony and ensure all information is easily readable.',
        });
      }
    }

    return suggestions.slice(0, 3);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="AI Layout Suggestions" size="lg">
      <div className="space-y-4">
        {/* Header Info */}
        <div className="flex items-start gap-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <Sparkles size={20} className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-purple-900 dark:text-purple-100">
            <p className="font-medium mb-1">AI-Powered Design Recommendations</p>
            <p className="text-purple-800 dark:text-purple-200">
              Get professional layout suggestions based on design best practices and invoice standards.
            </p>
          </div>
        </div>

        {/* Configuration Warning */}
        {!isConfigured && (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle
              size={20}
              className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5"
            />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-medium mb-1">AI Service Not Configured</p>
              <p>
                To use AI-powered layout suggestions, please set the VITE_GEMINI_API_KEY
                environment variable. Showing fallback suggestions based on design best practices.
              </p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && !isLoading && currentLayout.length > 0 && isConfigured && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
            <XCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800 dark:text-red-200">{error}</div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Analyzing your layout...</p>
          </div>
        )}

        {/* Suggestions */}
        {!isLoading && suggestions.length > 0 && (
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary-500 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                    <Lightbulb size={16} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {index + 1}. {suggestion.title}
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {suggestion.description}
                    </p>
                    <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/30 rounded p-3">
                      <CheckCircle
                        size={16}
                        className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                      />
                      <p className="text-xs text-blue-900 dark:text-blue-100">
                        <span className="font-medium">Why this helps:</span> {suggestion.reasoning}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={onClose} fullWidth>
            Close
          </Button>
          {hasGenerated && (
            <Button
              variant="ghost"
              onClick={handleGenerateSuggestions}
              loading={isLoading}
              fullWidth
            >
              <Sparkles size={18} className="mr-2" />
              Get New Suggestions
            </Button>
          )}
        </div>

        {/* Tips */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Tips:</h4>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Apply suggestions one at a time and preview the results</li>
            <li>• These are recommendations - adapt them to your brand style</li>
            <li>• Test your layout by generating a sample invoice</li>
            <li>• Save multiple template variations to compare</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};
