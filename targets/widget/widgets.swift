import WidgetKit
import SwiftUI

// MARK: - Quote Model
struct Quote: Decodable {
    let categories: [String: [String]]

    enum CodingKeys: String, CodingKey {
        case selfCare = "self-care"
        case mindfulness
        case motivation
        case gratitude
        case confidence
        case peace
        case growth
        case energy
        case overthinking
        case stressRelief = "stress-relief"
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        var categoriesDict: [String: [String]] = [:]

        categoriesDict["self-care"] = try container.decode([String].self, forKey: .selfCare)
        categoriesDict["mindfulness"] = try container.decode([String].self, forKey: .mindfulness)
        categoriesDict["motivation"] = try container.decode([String].self, forKey: .motivation)
        categoriesDict["gratitude"] = try container.decode([String].self, forKey: .gratitude)
        categoriesDict["confidence"] = try container.decode([String].self, forKey: .confidence)
        categoriesDict["peace"] = try container.decode([String].self, forKey: .peace)
        categoriesDict["growth"] = try container.decode([String].self, forKey: .growth)
        categoriesDict["energy"] = try container.decode([String].self, forKey: .energy)
        categoriesDict["overthinking"] = try container.decode([String].self, forKey: .overthinking)
        categoriesDict["stress-relief"] = try container.decode([String].self, forKey: .stressRelief)

        self.categories = categoriesDict
    }
}

// MARK: - Provider
struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> QuoteEntry {
        QuoteEntry(date: Date(), quote: "You are capable of amazing things")
    }

    func getSnapshot(in context: Context, completion: @escaping (QuoteEntry) -> ()) {
        let entry = QuoteEntry(date: Date(), quote: getRandomQuote())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        var entries: [QuoteEntry] = []

        // Generate entries for the next 24 hours, one per hour
        let currentDate = Date()
        for hourOffset in 0 ..< 24 {
            let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
            let entry = QuoteEntry(date: entryDate, quote: getRandomQuote())
            entries.append(entry)
        }

        let timeline = Timeline(entries: entries, policy: .atEnd)
        completion(timeline)
    }

    private func getRandomQuote() -> String {
        guard let url = Bundle.main.url(forResource: "quotes", withExtension: "json"),
              let data = try? Data(contentsOf: url),
              let quotesData = try? JSONDecoder().decode(Quote.self, from: data) else {
            return "You are amazing"
        }

        let allCategories = Array(quotesData.categories.values)
        let allQuotes = allCategories.flatMap { $0 }

        guard !allQuotes.isEmpty else {
            return "You are amazing"
        }

        return allQuotes.randomElement() ?? "You are amazing"
    }
}

// MARK: - Timeline Entry
struct QuoteEntry: TimelineEntry {
    let date: Date
    let quote: String
}

// MARK: - Widget Views
struct SmallQuoteWidgetView: View {
    var entry: Provider.Entry

    var body: some View {
        ZStack(alignment: .bottomLeading) {
            VStack {
                Spacer()
                Text(entry.quote)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(Color(hex: "2C3E5B"))
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 12)
                    .padding(.top, 12)
                Spacer()
            }

            Image("MascotImage")
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(width: 65, height: 65)
                .rotationEffect(.degrees(-15))
                .padding(.leading, -25)
                .padding(.bottom, -30)
        }
    }
}

struct MediumQuoteWidgetView: View {
    var entry: Provider.Entry

    var body: some View {
        ZStack(alignment: .bottomLeading) {
            VStack {
                Spacer()
                Text(entry.quote)
                    .font(.system(size: 18, weight: .medium))
                    .foregroundColor(Color(hex: "2C3E5B"))
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 20)
                    .padding(.top, 16)
                Spacer()
            }

            Image("MascotImage")
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(width: 90, height: 90)
                .rotationEffect(.degrees(-15))
                .padding(.leading, -50)
                .padding(.bottom, -40)
        }
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
    QuoteEntry(date: .now, quote: "You are capable of amazing things")
    QuoteEntry(date: .now, quote: "Every step forward is progress")
}

#Preview(as: .systemMedium) {
    MediumQuoteWidget()
} timeline: {
    QuoteEntry(date: .now, quote: "You are capable of amazing things")
    QuoteEntry(date: .now, quote: "Every step forward is progress")
}
