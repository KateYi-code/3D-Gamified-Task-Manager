import type { Meta, StoryObj } from "@storybook/react";
import { CountDownClock } from "./CountDownClock";

const meta: Meta<typeof CountDownClock> = {
  component: CountDownClock,
  title: "Components/Task/CountDownClock",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    initialMinutes: {
      control: { type: "number" },
      description: "Initial minutes to start the countdown from",
    },
    initialSeconds: {
      control: { type: "number" },
      description: "Initial seconds to start the countdown from",
    },
    onComplete: {
      action: "completed",
      description: "Callback function that will be called when the countdown completes",
    },
  },
};

export default meta;
type Story = StoryObj<typeof CountDownClock>;

export const Default: Story = {
  args: {
    initialMinutes: 0,
    initialSeconds: 0,
  },
};

export const ShortTimer: Story = {
  args: {
    initialMinutes: 0,
    initialSeconds: 10,
  },
};

export const LongTimer: Story = {
  args: {
    initialMinutes: 5,
    initialSeconds: 0,
  },
};

export const CustomTimer: Story = {
  args: {
    initialMinutes: 1,
    initialSeconds: 30,
  },
};