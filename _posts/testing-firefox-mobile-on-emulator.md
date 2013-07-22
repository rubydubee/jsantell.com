{{{
  "title" : "Testing Firefox Mobile Add-ons with an Emulator",
  "tags" : [ "jetpack", "firefox", "android" ],
  "category" : "jetpack",
  "date" : "7-22-2013",
  "description" : "A tutorial for setting up an Android emulator for running Jetpack tests and add-ons on Firefox for Android"
}}}

Firefox's [Add-on SDK](https://addons.mozilla.org/en-US/developers/) provides abstractions for manipulating components such as [tabs](https://addons.mozilla.org/en-US/developers/docs/sdk/latest/modules/sdk/tabs.html) and [page-workers](https://addons.mozilla.org/en-US/developers/docs/sdk/latest/modules/sdk/page-worker.html) between Firefox desktop and Firefox for Android. There are [several](https://blog.mozilla.org/addons/2012/02/06/mobile-add-on-development-using-the-add-on-sdk/) [guides](https://addons.mozilla.org/en-US/developers/docs/sdk/latest/dev-guide/tutorials/mobile.html) for testing an add-on with an Android device, but not all developers have a device for testing; here's how to run your add-on with the Android emulator.

<img src="/img/posts/firefoxandroiddude.png" class="center" alt="Firefox and Android" />

<!--more-->

This walkthrough is for OSX -- similar steps are used for Windows and Linux as well. "Fennec" is used several times throughout this guide, which is the codename for Firefox on Android.

## Download the Android SDK

The first step is getting the appropriate tools. Grab the [Android ADT bundle](http://developer.android.com/sdk/index.html) and unzip the package. On OSX, the download page thinks Firefox is Windows. Open it up in Safari to get the up to date OSX link. We'll be saving this in our `.bin` directory as:

<pre>
~/.bin/android-sdk-macosx
</pre>

From there, we have access to the following CLI tools we'll be using;

* `android`
* `emulator`
* `adb`
* `mksdcard`

You can reference them directly, or add `~/.bin/android-sdk-macosx/sdk/platform-tools` and `~/.bin/android-sdk-macosx/sdk/tools` to your path. The following commands will assume `~/.bin/android-sdk-macosx/sdk` is your PWD.


## Set up the Environment

There are a few components that need to be created before we can start testing. First, we need to create an Android Virtual Device (AVD), a virtual image of our mobile operating system. The name of our AVD is `jetpack`, and this can be any name you'd like. For additional options for your AVD, check out the [documentation](http://developer.android.com/tools/help/android.html).

<pre>
$ ./tools/android create avd -n jetpack -t 1
</pre>

Next, we need to set up an sdcard image. Using the `mksdcard` tool, create an image for the sdcard we can use. For more options, check out the [mksdcard documentation](http://developer.android.com/tools/help/mksdcard.html).

<pre>
$ ./tools/mksdcard -l jetpackSdCard 1024M ~/jetpacksdcard.img
</pre>

The last step before we run the emulator is grabbing the Firefox mobile app. In this example, we'll be using the latest Nightly build. [Download the APK](http://nightly.mozilla.org). We won't install it just yet.

## Running the Emulator

Time to boot up our emulator! We have to specify what AVD and sdcard to use, and there are [many more options](http://developer.android.com/tools/help/emulator.html) available. In this example, we'll just use the minimum needed.

<pre>
$ ./tools/emulator -avd jetpack -sdcard ~/jetpacksdcard.img
</pre>

This will fire up the emulator. This may take some time. The `no-boot-anim` flag seemmed to reduce boot up time for me. With the emulator running, ensure that `adb` detects the emulator running. The following command should list the emulator device.

<pre>
$ ./platform-tools/adb devices
</pre>

With the emulator running, we can install Firefox onto the virtual disk:

<pre>
$ ./platform-tools/adb install /path/to/fennec-nightly.apk
</pre>

Make sure you can see Firefox on the emulator!

<img src="/img/posts/android_fennec.png" class="center" alt="Fennec on Android" />

## Running your Add-on in the Emulator


This should display an emulator device in the list. Now we can run the same [cfx commands](https://addons.mozilla.org/en-US/developers/docs/sdk/latest/dev-guide/tutorials/mobile.html) that we use to run on an Android device, but instead, using the emulator.

Navigate to your add-on's directory; we'll just do a basic run command via `cfx` (make sure you set up cfx like you normally would via `source bin/activate` in the SDK directory!):

<pre>
$ cfx run -a fennec-on-device -b \
  ~/.bin/android-sdk-macosx/sdk/platform-tools/adb \
  --mobile-app fennec --force-mobile
</pre>

If you're using a release version of Firefox, replace the `--mobile-app` parameter with `firefox` instead of `fennec`.

Now you can run your add-on through the Android emulator, run its tests, or even test the SDK itself!

<img src="/img/posts/running_tests_fennec.png" class="center" alt="Running Tests on Fennec" />

[Let me know](http://twitter.com/jsantell) if this improved your workflow or if you had any issues with setting up the emulator! More and more features are being added to Firefox for Android in every release -- be sure to follow the [Add-ons Blog](https://blog.mozilla.org/addons/) for upcoming information and crank out some mobile add-ons!
