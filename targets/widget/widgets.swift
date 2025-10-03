import WidgetKit
import SwiftUI

// MARK: - Quote Models
struct QuoteObject: Codable {
    let id: String
    let text: String
}

struct QuotesData: Decodable {
    let general: [QuoteObject]?
    let winter: [QuoteObject]?
    let selfCare: [QuoteObject]?
    let mindfulness: [QuoteObject]?
    let motivation: [QuoteObject]?
    let gratitude: [QuoteObject]?
    let confidence: [QuoteObject]?
    let peace: [QuoteObject]?
    let growth: [QuoteObject]?
    let energy: [QuoteObject]?
    let overthinking: [QuoteObject]?
    let stressRelief: [QuoteObject]?

    enum CodingKeys: String, CodingKey {
        case general, winter, mindfulness, motivation, gratitude, confidence, peace, growth, energy, overthinking
        case selfCare = "self-care"
        case stressRelief = "stress-relief"
    }

    func quotes(for category: String) -> [QuoteObject]? {
        switch category {
        case "general": return general
        case "winter": return winter
        case "self-care": return selfCare
        case "mindfulness": return mindfulness
        case "motivation": return motivation
        case "gratitude": return gratitude
        case "confidence": return confidence
        case "peace": return peace
        case "growth": return growth
        case "energy": return energy
        case "overthinking": return overthinking
        case "stress-relief": return stressRelief
        default: return nil
        }
    }
}

// MARK: - Favorite Quote Model
struct FavoriteQuote: Codable {
    let text: String
    let category: String
}

// MARK: - Custom Quote Model
struct CustomQuote: Codable {
    let id: String
    let text: String
    let createdAt: String
    let isFavorited: Bool
}

// MARK: - Provider
struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> QuoteEntry {
        QuoteEntry(date: Date(), quoteId: "motivation-1", quoteText: "You are capable of amazing things", category: "general")
    }

    func getSnapshot(in context: Context, completion: @escaping (QuoteEntry) -> ()) {
        let displaySizeHash = context.displaySize.hashValue
        let result = getQuoteForCurrentHour(displaySizeHash: displaySizeHash)
        let entry = QuoteEntry(date: Date(), quoteId: result.id, quoteText: result.text, category: result.category)
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        var entries: [QuoteEntry] = []
        let displaySizeHash = context.displaySize.hashValue

        // Generate entries for the next 24 hours, one per hour
        let currentDate = Date()
        for hourOffset in 0 ..< 24 {
            let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
            let result = getQuoteForHour(entryDate, displaySizeHash: displaySizeHash)
            let entry = QuoteEntry(date: entryDate, quoteId: result.id, quoteText: result.text, category: result.category)
            entries.append(entry)
        }

        let timeline = Timeline(entries: entries, policy: .atEnd)
        completion(timeline)
    }

    private func getQuoteForCurrentHour(displaySizeHash: Int) -> (id: String, text: String, category: String) {
        return getQuoteForHour(Date(), displaySizeHash: displaySizeHash)
    }

    private func getQuoteForHour(_ date: Date, displaySizeHash: Int) -> (id: String, text: String, category: String) {
        guard let url = Bundle.main.url(forResource: "quotes", withExtension: "json"),
              let data = try? Data(contentsOf: url),
              let quotesData = try? JSONDecoder().decode(QuotesData.self, from: data) else {
            print("❌ Widget: Failed to load quotes.json")
            return ("motivation-1", "You are amazing", "general")
        }

        // Read selected categories from shared storage
        let defaults = UserDefaults(suiteName: "group.com.arthurbuildsstuff.glow.widget")
        var selectedCategories: [String] = ["general"]

        if let categoriesJSON = defaults?.string(forKey: "selectedCategories"),
           let categoriesData = categoriesJSON.data(using: .utf8),
           let categories = try? JSONDecoder().decode([String].self, from: categoriesData),
           !categories.isEmpty {
            selectedCategories = categories
        }

        // Collect all quote objects from selected categories
        var quotesToUse: [QuoteObject] = []

        for category in selectedCategories {
            if category == "favorites" {
                // TODO: Handle favorites with IDs
                continue
            } else if category == "custom" {
                // TODO: Handle custom quotes with IDs
                continue
            } else if let categoryQuotes = quotesData.quotes(for: category) {
                quotesToUse.append(contentsOf: categoryQuotes)
            }
        }

        // Fallback to general if no quotes
        if quotesToUse.isEmpty {
            quotesToUse = quotesData.general ?? []
        }

        guard !quotesToUse.isEmpty else {
            return ("motivation-1", "You are amazing", "general")
        }

        // Use hour + displaySize hash for deterministic but unique selection per widget instance
        let hoursSinceEpoch = Int(date.timeIntervalSince1970 / 3600)
        let index = abs(hoursSinceEpoch + displaySizeHash) % quotesToUse.count
        let selectedQuote = quotesToUse[index]

        // Determine category label
        let categoryLabel = selectedCategories.count > 1 ? "My mix" : (selectedCategories.first ?? "general")

        print("💬 Widget: Selected quote ID \(selectedQuote.id) for hour \(hoursSinceEpoch) with hash \(displaySizeHash)")
        return (selectedQuote.id, selectedQuote.text, categoryLabel)
    }
}

// MARK: - Timeline Entry
struct QuoteEntry: TimelineEntry {
    let date: Date
    let quoteId: String
    let quoteText: String
    let category: String
}

// MARK: - Widget Views
struct SmallQuoteWidgetView: View {
    var entry: Provider.Entry

    var body: some View {
        ZStack(alignment: .bottomLeading) {
            VStack(spacing: 0) {
                Text(entry.quoteText)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(Color(hex: "2C3E5B"))
                    .multilineTextAlignment(.center)
                    .lineLimit(nil)
                    .minimumScaleFactor(0.7)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 12)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            }

            Image("MascotImage")
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(width: 55, height: 55)
                .rotationEffect(.degrees(-15))
                .padding(.leading, -20)
                .padding(.bottom, -25)
        }
        .widgetURL(createDeepLink(id: entry.quoteId))
    }

    private func createDeepLink(id: String) -> URL? {
        return URL(string: "glow://?id=\(id)")
    }
}

struct MediumQuoteWidgetView: View {
    var entry: Provider.Entry

    var body: some View {
        ZStack(alignment: .bottomLeading) {
            VStack(spacing: 0) {
                Text(entry.quoteText)
                    .font(.system(size: 18, weight: .medium))
                    .foregroundColor(Color(hex: "2C3E5B"))
                    .multilineTextAlignment(.center)
                    .lineLimit(nil)
                    .minimumScaleFactor(0.75)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 16)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            }

            Image("MascotImage")
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(width: 80, height: 80)
                .rotationEffect(.degrees(-15))
                .padding(.leading, -40)
                .padding(.bottom, -35)
        }
        .widgetURL(createDeepLink(id: entry.quoteId))
    }

    private func createDeepLink(id: String) -> URL? {
        return URL(string: "glow://?id=\(id)")
    }
}

// MARK: - Widgets
struct SmallQuoteWidget: Widget {
    let kind: String = "SmallQuoteWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            SmallQuoteWidgetView(entry: entry)
                .containerBackground(Color(hex: "FFF8F3"), for: .widget)
        }
        .configurationDisplayName("Glow Quote - Small")
        .description("Daily motivation in a small widget")
        .supportedFamilies([.systemSmall])
    }
}

struct MediumQuoteWidget: Widget {
    let kind: String = "MediumQuoteWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            MediumQuoteWidgetView(entry: entry)
                .containerBackground(Color(hex: "FFF8F3"), for: .widget)
        }
        .configurationDisplayName("Glow Quote - Medium")
        .description("Daily motivation in a medium widget")
        .supportedFamilies([.systemMedium])
    }
}

struct LockScreenQuoteWidgetView: View {
    var entry: Provider.Entry

    var body: some View {
        VStack(spacing: 4) {
            Text(entry.quoteText)
                .font(.system(size: 13, weight: .medium))
                .foregroundColor(.white)
                .multilineTextAlignment(.center)
                .lineLimit(3)
                .minimumScaleFactor(0.8)
        }
        .widgetURL(createDeepLink(id: entry.quoteId))
    }

    private func createDeepLink(id: String) -> URL? {
        return URL(string: "glow://?id=\(id)")
    }
}

struct LockScreenQuoteWidget: Widget {
    let kind: String = "LockScreenQuoteWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            LockScreenQuoteWidgetView(entry: entry)
                .containerBackground(for: .widget) {
                    Color.clear
                }
        }
        .configurationDisplayName("Glow Quote - Lock Screen")
        .description("Daily motivation on your lock screen")
        .supportedFamilies([.accessoryRectangular])
    }
}

// MARK: - Color Extension
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

#Preview(as: .systemSmall) {
    SmallQuoteWidget()
} timeline: {
    QuoteEntry(date: .now, quoteId: "motivation-1", quoteText: "You are capable of amazing things", category: "motivation")
    QuoteEntry(date: .now, quoteId: "growth-2", quoteText: "Every step forward is progress", category: "growth")
}

#Preview(as: .systemMedium) {
    MediumQuoteWidget()
} timeline: {
    QuoteEntry(date: .now, quoteId: "motivation-1", quoteText: "You are capable of amazing things", category: "motivation")
    QuoteEntry(date: .now, quoteId: "growth-2", quoteText: "Every step forward is progress", category: "growth")
}

#Preview(as: .accessoryRectangular) {
    LockScreenQuoteWidget()
} timeline: {
    QuoteEntry(date: .now, quoteId: "motivation-1", quoteText: "You are capable of amazing things", category: "motivation")
    QuoteEntry(date: .now, quoteId: "growth-2", quoteText: "Every step forward is progress", category: "growth")
}
