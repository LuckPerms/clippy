/*
 * This file is part of clippy, licensed under the MIT License.
 *
 *  Copyright (c) lucko (Luck) <luck@lucko.me>
 *  Copyright (c) contributors
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 */

package me.lucko.clippy;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import sx.blah.discord.api.ClientBuilder;
import sx.blah.discord.api.IDiscordClient;
import sx.blah.discord.api.events.IListener;
import sx.blah.discord.handle.impl.events.ReadyEvent;
import sx.blah.discord.handle.impl.events.guild.channel.message.MessageReceivedEvent;
import sx.blah.discord.handle.impl.events.guild.member.UserJoinEvent;
import sx.blah.discord.handle.obj.ActivityType;
import sx.blah.discord.handle.obj.IChannel;
import sx.blah.discord.handle.obj.IGuild;
import sx.blah.discord.handle.obj.IMessage;
import sx.blah.discord.handle.obj.IRole;
import sx.blah.discord.handle.obj.IUser;
import sx.blah.discord.handle.obj.StatusType;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import java.util.logging.ConsoleHandler;
import java.util.logging.FileHandler;
import java.util.logging.Formatter;
import java.util.logging.Level;
import java.util.logging.LogRecord;
import java.util.logging.Logger;

public class Clippy {

    // Bootstrap
    public static void main(String[] args) {
        new Clippy();
    }

    private static final SimpleDateFormat DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd");

    private final IDiscordClient client;
    private final Logger logger;
    private final ScheduledExecutorService executorService = Executors.newSingleThreadScheduledExecutor();

    private IGuild guild;
    private List<IRole> staffRoles = new ArrayList<>();
    private IRole memberRole;

    public Clippy() {
        this.logger = Logger.getLogger("clippy");
        this.logger.setLevel(Level.ALL);
        this.logger.setUseParentHandlers(false);

        Formatter formatter = new Formatter() {
            private final DateFormat dateFormat = DateFormat.getTimeInstance(DateFormat.MEDIUM);

            @Override
            public String format(LogRecord record) {
                return String.format(
                        "%s [%s] %s\n",
                        this.dateFormat.format(new Date(record.getMillis())),
                        record.getLevel().getName(),
                        record.getMessage()
                );
            }
        };

        ConsoleHandler consoleHandler = new ConsoleHandler();
        consoleHandler.setFormatter(formatter);
        this.logger.addHandler(consoleHandler);

        class RotatingFileHandler extends FileHandler {
            private final String date;

            private RotatingFileHandler(String date) throws IOException, SecurityException {
                super(date + ".log", true);
                this.date = date;
            }
        }

        // this kinda sucks lol
        AtomicReference<RotatingFileHandler> currentHandler = new AtomicReference<>(null);
        this.executorService.scheduleAtFixedRate(() -> {
            try {
                String date = DATE_FORMAT.format(new Date(System.currentTimeMillis()));
                RotatingFileHandler current = currentHandler.get();

                if (current == null) {
                    RotatingFileHandler fileHandler = new RotatingFileHandler(date);
                    fileHandler.setFormatter(formatter);
                    this.logger.addHandler(fileHandler);
                    currentHandler.set(fileHandler);
                    return;
                }

                if (current.date.equals(date)) {
                    return;
                }

                this.logger.removeHandler(current);
                RotatingFileHandler fileHandler = new RotatingFileHandler(date);
                fileHandler.setFormatter(formatter);
                this.logger.addHandler(fileHandler);
                currentHandler.set(fileHandler);
                current.close();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }, 1, 30, TimeUnit.SECONDS);

        JsonObject config;
        try (BufferedReader reader = Files.newBufferedReader(Paths.get("config.json"), StandardCharsets.UTF_8)) {
            config = new Gson().fromJson(reader, JsonObject.class);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        ClientBuilder clientBuilder = new ClientBuilder()
                .setPresence(StatusType.ONLINE, ActivityType.WATCHING, "you.")
                .withToken(config.get("token").getAsString());

        this.client = clientBuilder.login();

        IListener<MessageReceivedEvent> messageListener = event -> {
            IUser author = event.getAuthor();
            IMessage message = event.getMessage();
            IChannel channel = event.getChannel();

            List<IUser> mentions = message.getMentions();
            if (mentions != null && !mentions.isEmpty() && !isStaff(author) && mentions.stream().anyMatch(this::isStaff)) {
                //message.delete();
                channel.sendMessage("Hey " + author.getDisplayName(this.guild) + "! Please don't tag staff members.");
            }

            this.logger.info("[" + channel.getName() + "] " + author.getName() + "#" + author.getDiscriminator() + ": " + message.getFormattedContent());
        };

        IListener<UserJoinEvent> joinListener = event -> {
            IUser user = event.getUser();
            user.addRole(this.memberRole);
        };

        IListener<ReadyEvent> startupListener = event -> {
            this.logger.info("Ready event called - setting up discord hook!");
            this.guild = this.client.getGuildByID(config.get("guild").getAsLong());

            this.staffRoles.addAll(this.guild.getRolesByName("staff"));
            this.memberRole = this.guild.getRolesByName("member").get(0);

            this.client.getDispatcher().registerListener(messageListener);
            this.client.getDispatcher().registerListener(joinListener);
        };

        this.client.getDispatcher().registerListener(startupListener);
    }

    private boolean isStaff(IUser user) {
        return staffRoles.stream().anyMatch(user::hasRole);
    }
}
