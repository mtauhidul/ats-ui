import React from 'react';
import { colors, typography, tailwindClasses } from '../lib/design-tokens';

interface DesignSystemDemoProps {
  className?: string;
}

export const DesignSystemDemo: React.FC<DesignSystemDemoProps> = ({ className = '' }) => {
  return (
    <div className={`p-6 space-y-8 ${tailwindClasses.backgrounds.black} ${tailwindClasses.text.primary} min-h-screen ${className}`}>
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-heading font-semibold mb-2">ATS UI Design System</h1>
        <p className={`text-body ${tailwindClasses.text.secondary}`}>
          Comprehensive styling guide implementation
        </p>
      </header>

      {/* Color Palette Section */}
      <section className="space-y-4">
        <h2 className="text-heading font-semibold">Color Palette</h2>
        
        <div className="space-y-6">
          {/* Primary Colors */}
          <div>
            <h3 className={`text-body font-medium mb-3 ${tailwindClasses.text.secondary}`}>Primary Colors</h3>
            <div className="flex gap-4 flex-wrap">
              <div className={`p-4 rounded-lg ${tailwindClasses.backgrounds.black} border ${tailwindClasses.borders.mediumGray}`}>
                <div className="w-20 h-20 rounded mb-2" style={{ backgroundColor: colors.black }}></div>
                <p className="text-label font-medium">Black</p>
                <p className={`text-label ${tailwindClasses.text.subtle}`}>{colors.black}</p>
              </div>
              <div className={`p-4 rounded-lg ${tailwindClasses.backgrounds.deepGray} border ${tailwindClasses.borders.mediumGray}`}>
                <div className="w-20 h-20 rounded mb-2" style={{ backgroundColor: colors.deepGray }}></div>
                <p className="text-label font-medium">Deep Gray</p>
                <p className={`text-label ${tailwindClasses.text.subtle}`}>{colors.deepGray}</p>
              </div>
              <div className={`p-4 rounded-lg ${tailwindClasses.backgrounds.mediumGray} border ${tailwindClasses.borders.mediumGray}`}>
                <div className="w-20 h-20 rounded mb-2" style={{ backgroundColor: colors.mediumGray }}></div>
                <p className="text-label font-medium">Medium Gray</p>
                <p className={`text-label ${tailwindClasses.text.subtle}`}>{colors.mediumGray}</p>
              </div>
            </div>
          </div>

          {/* Accent Colors */}
          <div>
            <h3 className={`text-body font-medium mb-3 ${tailwindClasses.text.secondary}`}>Accent Colors</h3>
            <div className="flex gap-4 flex-wrap">
              <div className={`p-4 rounded-lg ${tailwindClasses.backgrounds.deepGray} border ${tailwindClasses.borders.mediumGray}`}>
                <div className="w-20 h-20 rounded mb-2" style={{ backgroundColor: colors.purple }}></div>
                <p className="text-label font-medium">Purple</p>
                <p className={`text-label ${tailwindClasses.text.subtle}`}>{colors.purple}</p>
              </div>
              <div className={`p-4 rounded-lg ${tailwindClasses.backgrounds.deepGray} border ${tailwindClasses.borders.mediumGray}`}>
                <div className="w-20 h-20 rounded mb-2" style={{ backgroundColor: colors.yellow }}></div>
                <p className="text-label font-medium">Yellow</p>
                <p className={`text-label ${tailwindClasses.text.subtle}`}>{colors.yellow}</p>
              </div>
              <div className={`p-4 rounded-lg ${tailwindClasses.backgrounds.deepGray} border ${tailwindClasses.borders.mediumGray}`}>
                <div className="w-20 h-20 rounded mb-2" style={{ backgroundColor: colors.green }}></div>
                <p className="text-label font-medium">Green</p>
                <p className={`text-label ${tailwindClasses.text.subtle}`}>{colors.green}</p>
              </div>
              <div className={`p-4 rounded-lg ${tailwindClasses.backgrounds.deepGray} border ${tailwindClasses.borders.mediumGray}`}>
                <div className="w-20 h-20 rounded mb-2" style={{ backgroundColor: colors.red }}></div>
                <p className="text-label font-medium">Red</p>
                <p className={`text-label ${tailwindClasses.text.subtle}`}>{colors.red}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Typography Section */}
      <section className="space-y-4">
        <h2 className="text-heading font-semibold">Typography</h2>
        
        <div className={`p-6 rounded-lg ${tailwindClasses.backgrounds.deepGray} border ${tailwindClasses.borders.mediumGray} space-y-4`}>
          <div>
            <h3 className="text-heading font-semibold">Heading Text (20-28px, Semibold)</h3>
            <p className={`text-label ${tailwindClasses.text.subtle}`}>Inter/Poppins, 600 weight</p>
          </div>
          
          <div>
            <p className="text-body font-regular">Body Text (14-16px, Regular)</p>
            <p className={`text-label ${tailwindClasses.text.subtle}`}>Inter/Poppins, 400 weight</p>
          </div>
          
          <div>
            <p className="text-body font-medium">Body Text Medium (14-16px, Medium)</p>
            <p className={`text-label ${tailwindClasses.text.subtle}`}>Inter/Poppins, 500 weight</p>
          </div>
          
          <div>
            <p className="text-label font-regular">Label Text (12-13px, Regular)</p>
            <p className={`text-label ${tailwindClasses.text.subtle}`}>Inter/Poppins, 400 weight</p>
          </div>
        </div>
      </section>

      {/* Text Colors Section */}
      <section className="space-y-4">
        <h2 className="text-heading font-semibold">Text Colors</h2>
        
        <div className={`p-6 rounded-lg ${tailwindClasses.backgrounds.deepGray} border ${tailwindClasses.borders.mediumGray} space-y-3`}>
          <p className={`text-body ${tailwindClasses.text.primary}`}>Primary Text (White) - #FFFFFF</p>
          <p className={`text-body ${tailwindClasses.text.secondary}`}>Secondary Text (Muted Gray) - #B3B3B3</p>
          <p className={`text-body ${tailwindClasses.text.subtle}`}>Subtle Text/Placeholder - #7A7A7A</p>
        </div>
      </section>

      {/* Components Section */}
      <section className="space-y-4">
        <h2 className="text-heading font-semibold">Component Examples</h2>
        
        <div className="space-y-6">
          {/* Buttons */}
          <div>
            <h3 className={`text-body font-medium mb-3 ${tailwindClasses.text.secondary}`}>Buttons</h3>
            <div className="flex gap-4 flex-wrap">
              <button 
                className="button-primary hover:opacity-90 transition-opacity"
                style={{
                  backgroundColor: colors.purple,
                  color: colors.text.primary,
                  fontWeight: typography.fontWeight.medium,
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Primary Button
              </button>
              <button 
                className="button-secondary hover:opacity-90 transition-opacity"
                style={{
                  backgroundColor: colors.yellow,
                  color: colors.black,
                  fontWeight: typography.fontWeight.medium,
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Secondary Button
              </button>
            </div>
          </div>

          {/* Cards */}
          <div>
            <h3 className={`text-body font-medium mb-3 ${tailwindClasses.text.secondary}`}>Cards</h3>
            <div className={`p-6 rounded-lg border ${tailwindClasses.backgrounds.deepGray} ${tailwindClasses.borders.mediumGray}`}>
              <h4 className="text-body font-semibold mb-2">Sample Card</h4>
              <p className={`text-body ${tailwindClasses.text.secondary} mb-4`}>
                This is an example of a card component using the deep gray background with medium gray borders.
              </p>
              <div className="flex gap-2">
                <span className={`text-label px-2 py-1 rounded ${tailwindClasses.backgrounds.purple} ${tailwindClasses.text.primary}`}>
                  Tag 1
                </span>
                <span className={`text-label px-2 py-1 rounded ${tailwindClasses.backgrounds.mediumGray} ${tailwindClasses.text.secondary}`}>
                  Tag 2
                </span>
              </div>
            </div>
          </div>

          {/* Form Elements */}
          <div>
            <h3 className={`text-body font-medium mb-3 ${tailwindClasses.text.secondary}`}>Form Elements</h3>
            <div className="space-y-3 max-w-md">
              <input
                type="text"
                placeholder="Enter text here..."
                className={`w-full p-3 rounded border ${tailwindClasses.backgrounds.deepGray} ${tailwindClasses.borders.mediumGray} ${tailwindClasses.text.primary} focus:border-[${colors.purple}] focus:outline-none`}
                style={{
                  backgroundColor: colors.deepGray,
                  borderColor: colors.mediumGray,
                  color: colors.text.primary,
                }}
              />
              <textarea
                placeholder="Enter description..."
                rows={3}
                className={`w-full p-3 rounded border resize-none ${tailwindClasses.backgrounds.deepGray} ${tailwindClasses.borders.mediumGray} ${tailwindClasses.text.primary} focus:border-[${colors.purple}] focus:outline-none`}
                style={{
                  backgroundColor: colors.deepGray,
                  borderColor: colors.mediumGray,
                  color: colors.text.primary,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Data Visualization Colors */}
      <section className="space-y-4">
        <h2 className="text-heading font-semibold">Data Visualization</h2>
        
        <div className={`p-6 rounded-lg ${tailwindClasses.backgrounds.deepGray} border ${tailwindClasses.borders.mediumGray}`}>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.chart.line1 }}></div>
              <span className="text-body">Chart Line 1: {colors.chart.line1}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.chart.line2 }}></div>
              <span className="text-body">Chart Line 2: {colors.chart.line2}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.chart.mapDots }}></div>
              <span className="text-body">Map Dots/Heat Area: {colors.chart.mapDots}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DesignSystemDemo;