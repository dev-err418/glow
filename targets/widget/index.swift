import WidgetKit
import SwiftUI

@main
struct exportWidgets: WidgetBundle {
    var body: some Widget {
        // Export widgets here
        SmallQuoteWidget()
        MediumQuoteWidget()
        LockScreenQuoteWidget()
        widgetControl()
        WidgetLiveActivity()
    }
}
