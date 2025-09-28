// Type declarations for react-native-onboarding-swiper
declare module 'react-native-onboarding-swiper' {
  import { Component } from 'react';
  import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

  export interface OnboardingPage {
    backgroundColor: string;
    image: React.ReactElement;
    title: string;
    subtitle: string;
  }

  export interface OnboardingProps {
    pages: OnboardingPage[];
    onDone?: () => void;
    onSkip?: () => void;
    showSkip?: boolean;
    showNext?: boolean;
    showDone?: boolean;
    bottomBarHighlight?: boolean;
    bottomBarHeight?: number;
    titleStyles?: TextStyle;
    subTitleStyles?: TextStyle;
    skipLabel?: string;
    nextLabel?: string;
    doneLabel?: string;
    skipButtonComponent?: (props: { onPress: () => void }) => React.ReactElement;
    nextButtonComponent?: (props: { onPress: () => void }) => React.ReactElement;
    doneButtonComponent?: (props: { onPress: () => void }) => React.ReactElement;
  }

  export default class Onboarding extends Component<OnboardingProps> {}
}
